from datetime import date, datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DuplicateEntityException, OperationNotSupportedException, RecordNotFoundException
from app.models.enums import Department, Region
from app.models.project import Project
from app.schemas.common import MessageResponse
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.utils.date_utils import first_day_of_next_month
from app.utils.mapper import project_to_response


class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self, department: Department | None, region: Region | None) -> list[ProjectResponse]:
        stmt = select(Project).where(
            (department is None) | ((Project.department.op("&")(int(department))) > 0) if department else True,
            (region is None) | ((Project.region.op("&")(int(region))) > 0) if region else True,
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= datetime.now(timezone.utc)),
        )
        projects = (await self._db.execute(stmt)).scalars().all()
        return [project_to_response(p) for p in projects]

    async def get_all_for_period(
        self,
        year: int,
        month: int,
        department: Department | None,
        region: Region | None,
    ) -> list[ProjectResponse]:
        next_month = first_day_of_next_month(year, month)
        stmt = select(Project).where(
            (department is None) | ((Project.department.op("&")(int(department))) > 0) if department else True,
            (region is None) | ((Project.region.op("&")(int(region))) > 0) if region else True,
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= next_month),
            Project.date_created < next_month,
        )
        projects = (await self._db.execute(stmt)).scalars().all()
        return [project_to_response(p) for p in projects]

    async def get_by_id(self, project_id: int) -> ProjectResponse:
        project = await self._from_id(project_id)
        return project_to_response(project)

    async def create(self, data: ProjectCreate) -> ProjectResponse:
        stmt = select(Project).where(
            Project.date_deleted.is_(None),
            (Project.number == data.number) | (Project.title == data.title),
        )
        existing = (await self._db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise DuplicateEntityException(f"Project already exists in {data.department} department.")

        project = Project(
            number=data.number,
            title=data.title,
            business=data.business,
            department=int(data.department),
            region=int(data.region),
            description=data.description or "",
            date_created=date.today(),
        )
        self._db.add(project)
        await self._db.flush()
        await self._db.refresh(project)
        return project_to_response(project)

    async def update(self, project_id: int, data: ProjectUpdate) -> ProjectResponse:
        project = await self._from_id(project_id)
        if project.date_deleted is not None:
            raise OperationNotSupportedException(
                f"Project with id {project_id} is scheduled to delete on {project.date_deleted}."
            )

        # If number or title change, soft-delete current and create new (mirrors C# logic)
        if data.number is not None or data.title is not None:
            today = date.today()
            if today.month == 1:
                last_prev = date(today.year - 1, 12, 31)
            else:
                from calendar import monthrange
                last_day = monthrange(today.year, today.month - 1)[1]
                last_prev = date(today.year, today.month - 1, last_day)

            project.date_modified = today
            project.date_deleted = datetime.combine(last_prev, datetime.min.time())

            new_project = Project(
                number=data.number or project.number,
                title=data.title or project.title,
                business=data.business or project.business,
                department=int(data.department) if data.department else project.department,
                region=int(data.region) if data.region else project.region,
                description=data.description if data.description is not None else project.description,
                date_created=today,
            )
            self._db.add(new_project)
            await self._db.flush()
            await self._db.refresh(new_project)
            return project_to_response(new_project)

        if data.department is not None:
            project.department = int(data.department)
        if data.description is not None:
            project.description = data.description
        if data.business is not None:
            project.business = data.business
        await self._db.flush()
        await self._db.refresh(project)
        return project_to_response(project)

    async def delete(self, project_id: int, delete_now: bool | None) -> MessageResponse:
        project = await self._from_id(project_id)
        if delete_now is not True:
            if project.date_deleted is not None:
                raise OperationNotSupportedException(
                    f"Project with id {project_id} is scheduled to delete on {project.date_deleted}."
                )
            today = date.today()
            project.date_deleted = datetime.combine(first_day_of_next_month(today.year, today.month), datetime.min.time())
        elif project.date_deleted is not None:
            project.date_deleted = None
        await self._db.delete(project)
        await self._db.flush()
        return MessageResponse(message=f"Project with id {project_id} is deleted successfully.")

    async def reset(self) -> MessageResponse:
        await self._db.execute(delete(Project))
        await self._db.flush()
        return MessageResponse(message="Projects table reset successfully.")

    async def _from_id(self, project_id: int) -> Project:
        stmt = select(Project).where(
            (Project.date_deleted.is_(None)) | (Project.date_deleted >= datetime.now(timezone.utc)),
            Project.id == project_id,
        )
        project = (await self._db.execute(stmt)).scalar_one_or_none()
        if project is None:
            raise RecordNotFoundException(f"Could not find any Project with id: {project_id}")
        return project
