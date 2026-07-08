from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecordNotFoundException
from app.models.enums import Department, Region, Role
from app.models.project import Project
from app.models.user import User
from app.models.week_data import WeekData
from app.schemas.dashboard import DashboardResponse, ProjectDashboardResponse, UserDashboardResponse
from app.schemas.project import ProjectResponse
from app.schemas.user import UserResponse
from app.utils.date_utils import first_day_of_next_month
from app.utils.mapper import project_to_response, user_to_response


def _week_total(wd: WeekData) -> int:
    return wd.week1 + wd.week2 + wd.week3 + wd.week4 + (wd.week5 or 0)


# Process-local timesheet lock state, keyed by "{department}-{region}".
# Mirrors the C# backend's in-memory IDistributedCache default — no
# external cache dependency, resets on restart.
_timesheet_locks: dict[str, bool] = {}


class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------ main dashboard

    async def get_dashboard(
        self, year: int, month: int, department: Department | None, region: Region | None
    ) -> DashboardResponse:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        proj_stmt = select(Project).where(
            (Project.department.op("&")(int(department))) > 0 if department is not None else True,
            (Project.region.op("&")(int(region))) > 0 if region is not None else True,
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= next_month),
            Project.date_created < next_month,
        )
        total_projects = len((await self._db.execute(proj_stmt)).scalars().all())

        user_stmt = select(User).where(
            (User.department.op("&")(int(department))) > 0 if department is not None else True,
            (User.region.op("&")(int(region))) > 0 if region is not None else True,
            (User.date_deleted.is_(None)) | (User.date_deleted >= next_month),
            User.date_created < next_month,
            User.role != int(Role.Executive),
        )
        users = list((await self._db.execute(user_stmt)).scalars().all())
        total_users = len(users)
        total_ext_users = sum(1 for u in users if u.is_external)

        wd_stmt = (
            select(WeekData)
            .options(selectinload(WeekData.user))
            .where(WeekData.year == year, WeekData.month == month)
        )
        week_data = list((await self._db.execute(wd_stmt)).scalars().all())
        if department is not None:
            week_data = [wd for wd in week_data if (wd.user.department & int(department))]
        if region is not None:
            week_data = [wd for wd in week_data if (wd.user.region & int(region))]

        total_work_hours = sum(_week_total(wd) for wd in week_data)
        total_ext_work_hours = sum(_week_total(wd) for wd in week_data if wd.user.is_external)

        return DashboardResponse(
            total_projects=total_projects,
            total_int_users=total_users - total_ext_users,
            total_ext_users=total_ext_users,
            total_users=total_users,
            total_int_work_hours=total_work_hours - total_ext_work_hours,
            total_ext_work_hours=total_ext_work_hours,
            total_work_hours=total_work_hours,
        )

    # ------------------------------------------------------------------ project dashboard

    async def get_project_dashboard(self, project_id: int) -> ProjectDashboardResponse:
        stmt = select(Project).where(Project.id == project_id)
        project = (await self._db.execute(stmt)).scalar_one_or_none()
        if project is None:
            raise RecordNotFoundException(f"Could not find any Project with id: {project_id}")

        wd_stmt = select(WeekData).options(selectinload(WeekData.user)).where(WeekData.project_id == project_id)
        week_data = list((await self._db.execute(wd_stmt)).scalars().all())

        user_ids = {wd.user_id for wd in week_data}
        total_users = len(user_ids)
        ext_user_ids = {wd.user_id for wd in week_data if wd.user.is_external}
        total_ext_users = len(ext_user_ids)
        total_work_hours = sum(_week_total(wd) for wd in week_data)
        total_ext_work_hours = sum(_week_total(wd) for wd in week_data if wd.user.is_external)

        return ProjectDashboardResponse(
            project_id=project.id,
            project_number=project.number,
            project_title=project.title,
            business=project.business,
            department=project.department,
            region=project.region,
            description=project.description,
            total_int_users=total_users - total_ext_users,
            total_ext_users=total_ext_users,
            total_users=total_users,
            total_int_work_hours=total_work_hours - total_ext_work_hours,
            total_ext_work_hours=total_ext_work_hours,
            total_work_hours=total_work_hours,
        )

    async def get_project_dashboard_for_period(
        self, year: int, month: int, project_id: int
    ) -> ProjectDashboardResponse:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        proj_stmt = select(Project).where(
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= next_month),
            Project.date_created < next_month,
            Project.id == project_id,
        )
        project = (await self._db.execute(proj_stmt)).scalar_one_or_none()
        if project is None:
            raise RecordNotFoundException(f"Could not find any Project with id: {project_id}")

        wd_stmt = (
            select(WeekData)
            .options(selectinload(WeekData.user))
            .where(WeekData.year == year, WeekData.month == month, WeekData.project_id == project_id)
        )
        week_data = list((await self._db.execute(wd_stmt)).scalars().all())

        total_users = len(week_data)
        total_ext_users = sum(1 for wd in week_data if wd.user.is_external)
        total_work_hours = sum(_week_total(wd) for wd in week_data)
        total_ext_work_hours = sum(_week_total(wd) for wd in week_data if wd.user.is_external)

        users = [
            UserResponse(
                id=wd.user.id,
                emp_id=wd.user.emp_id,
                user_name=wd.user.user_name,
                first_name=wd.user.first_name,
                last_name=wd.user.last_name,
                email=wd.user.email,
                is_external=wd.user.is_external,
                is_password_protected=wd.user.password_hash is not None,
                department=wd.user.department,
                region=wd.user.region,
                role=wd.user.role,
                work_hours_per_day=wd.user.work_hours_per_day,
                parent_id=wd.user.parent_id,
                last_saved_time=wd.user.last_saved_time,
                week1_hours=wd.week1,
                week2_hours=wd.week2,
                week3_hours=wd.week3,
                week4_hours=wd.week4,
                week5_hours=wd.week5,
            )
            for wd in week_data
        ]

        return ProjectDashboardResponse(
            project_id=project.id,
            project_number=project.number,
            project_title=project.title,
            business=project.business,
            department=project.department,
            region=project.region,
            description=project.description,
            total_int_users=total_users - total_ext_users,
            total_ext_users=total_ext_users,
            total_users=total_users,
            total_int_work_hours=total_work_hours - total_ext_work_hours,
            total_ext_work_hours=total_ext_work_hours,
            total_work_hours=total_work_hours,
            users=users,
        )

    async def get_all_project_dashboards(
        self, year: int, month: int, department: Department | None, region: Region | None
    ) -> list[ProjectDashboardResponse]:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        proj_stmt = select(Project).where(
            (Project.department.op("&")(int(department))) > 0 if department is not None else True,
            (Project.region.op("&")(int(region))) > 0 if region is not None else True,
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= next_month),
            Project.date_created < next_month,
        )
        project_ids = [p.id for p in (await self._db.execute(proj_stmt)).scalars().all()]
        return [await self.get_project_dashboard_for_period(year, month, pid) for pid in project_ids]

    # ------------------------------------------------------------------ user dashboard

    async def get_user_dashboard(self, user_id: int) -> UserDashboardResponse:
        stmt = select(User).where(User.id == user_id)
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            raise RecordNotFoundException(f"Could not find any User with id: {user_id}")

        wd_stmt = select(WeekData).where(WeekData.user_id == user_id)
        week_data = list((await self._db.execute(wd_stmt)).scalars().all())

        total_projects = len({wd.project_id for wd in week_data})
        return UserDashboardResponse(
            user_id=user.id, emp_id=user.emp_id, user_name=user.user_name,
            first_name=user.first_name, last_name=user.last_name, email=user.email,
            is_external=user.is_external, department=user.department, role=user.role,
            work_hours_per_day=user.work_hours_per_day, parent_id=user.parent_id,
            region=user.region, last_saved_time=user.last_saved_time,
            total_projects=total_projects,
            total_week1_hours=sum(wd.week1 for wd in week_data),
            total_week2_hours=sum(wd.week2 for wd in week_data),
            total_week3_hours=sum(wd.week3 for wd in week_data),
            total_week4_hours=sum(wd.week4 for wd in week_data),
            total_week5_hours=sum(wd.week5 or 0 for wd in week_data),
        )

    async def get_user_dashboard_for_period(self, year: int, month: int, user_id: int) -> UserDashboardResponse:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        user_stmt = select(User).where(
            (User.date_deleted.is_(None)) | (User.date_deleted >= datetime.now(timezone.utc)),
            User.date_created < next_month,
            User.id == user_id,
        )
        user = (await self._db.execute(user_stmt)).scalar_one_or_none()
        if user is None:
            raise RecordNotFoundException(f"Could not find any User with id: {user_id}")

        wd_stmt = (
            select(WeekData)
            .options(selectinload(WeekData.project))
            .where(WeekData.year == year, WeekData.month == month, WeekData.user_id == user_id)
        )
        user_week_data = list((await self._db.execute(wd_stmt)).scalars().all())

        projects = [
            ProjectResponse(
                id=wd.project.id,
                number=wd.project.number,
                title=wd.project.title,
                business=wd.project.business,
                department=wd.project.department,
                region=wd.project.region,
                description=wd.project.description,
                working_hours=_week_total(wd),
            )
            for wd in user_week_data
        ]

        return UserDashboardResponse(
            user_id=user.id, emp_id=user.emp_id, user_name=user.user_name,
            first_name=user.first_name, last_name=user.last_name, email=user.email,
            is_external=user.is_external, department=user.department, role=user.role,
            work_hours_per_day=user.work_hours_per_day, parent_id=user.parent_id,
            region=user.region, last_saved_time=user.last_saved_time,
            total_projects=len(user_week_data),
            total_week1_hours=sum(wd.week1 for wd in user_week_data),
            total_week2_hours=sum(wd.week2 for wd in user_week_data),
            total_week3_hours=sum(wd.week3 for wd in user_week_data),
            total_week4_hours=sum(wd.week4 for wd in user_week_data),
            total_week5_hours=sum(wd.week5 or 0 for wd in user_week_data),
            projects=projects,
        )

    async def get_all_user_dashboards(
        self, year: int, month: int, department: Department | None, region: Region | None
    ) -> list[UserDashboardResponse]:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        stmt = select(User).where(
            (User.department.op("&")(int(department))) > 0 if department is not None else True,
            (User.region.op("&")(int(region))) > 0 if region is not None else True,
            (User.date_deleted.is_(None)) | (User.date_deleted >= next_month),
            User.date_created < next_month,
            User.role != int(Role.Executive),
        )
        user_ids = [u.id for u in (await self._db.execute(stmt)).scalars().all()]
        return [await self.get_user_dashboard_for_period(year, month, uid) for uid in user_ids]

    async def get_user_dashboard_under_parent(
        self, year: int, month: int, parent_id: int, region: Region | None
    ) -> list[UserDashboardResponse]:
        await self._remove_zero_week_data(year, month)
        next_month = first_day_of_next_month(year, month)

        child_stmt = select(User).where(
            (User.region.op("&")(int(region))) > 0 if region is not None else True,
            (User.date_deleted.is_(None)) | (User.date_deleted >= next_month),
            User.parent_id == parent_id,
        )
        children = list((await self._db.execute(child_stmt)).scalars().all())

        result = [await self.get_user_dashboard_for_period(year, month, parent_id)]
        for child in children:
            child_tree = await self.get_user_dashboard_under_parent(year, month, child.id, region)
            result.extend(child_tree)
        return result

    async def get_users_with_unfilled_timesheet(
        self, year: int, month: int, department: Department | None, region: Region | None
    ) -> list[UserDashboardResponse]:
        await self._remove_zero_week_data(year, month)
        from datetime import date
        first_this = date(year, month, 1)
        next_month = first_day_of_next_month(year, month)

        stmt = select(User).where(
            (User.department.op("&")(int(department))) > 0 if department is not None else True,
            (User.region.op("&")(int(region))) > 0 if region is not None else True,
            (User.date_deleted.is_(None)) | (User.date_deleted >= next_month),
            User.date_created < next_month,
            User.role != int(Role.Executive),
            (User.last_saved_time.is_(None)) | (User.last_saved_time < first_this),
        )
        user_ids = [u.id for u in (await self._db.execute(stmt)).scalars().all()]
        return [await self.get_user_dashboard_for_period(year, month, uid) for uid in user_ids]

    # ------------------------------------------------------------------ lock timesheet

    async def get_lock(self, department: Department | None, region: Region | None) -> bool:
        return _timesheet_locks.get(f"{department}-{region}", False)

    async def set_lock(self, is_locked: bool, department: Department | None, region: Region | None) -> None:
        _timesheet_locks[f"{department}-{region}"] = is_locked

    # ------------------------------------------------------------------ helpers

    async def _remove_zero_week_data(self, year: int, month: int) -> None:
        stmt = select(WeekData).where(WeekData.year == year, WeekData.month == month)
        rows = list((await self._db.execute(stmt)).scalars().all())
        for wd in rows:
            if wd.week1 == 0 and wd.week2 == 0 and wd.week3 == 0 and wd.week4 == 0 and (wd.week5 or 0) == 0:
                await self._db.delete(wd)
        await self._db.flush()
