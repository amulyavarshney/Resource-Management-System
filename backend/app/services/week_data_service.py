from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import OperationNotSupportedException, RecordNotFoundException
from app.models.user import User
from app.models.week_data import WeekData
from app.schemas.common import MessageResponse
from app.schemas.week_data import WeekDataResponse, WeekDataUpdate
from app.services.dashboard_service import DashboardService


class WeekDataService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[WeekData]:
        result = await self._db.execute(select(WeekData))
        return list(result.scalars().all())

    async def get_by_period(self, year: int, month: int) -> list[WeekData]:
        result = await self._db.execute(
            select(WeekData).where(WeekData.year == year, WeekData.month == month)
        )
        return list(result.scalars().all())

    async def get_by_key(self, user_id: int, project_id: int, year: int, month: int) -> WeekDataResponse:
        wd = await self._find(user_id, project_id, year, month)
        if wd is None:
            return WeekDataResponse(week1=0, week2=0, week3=0, week4=0, week5=0)
        return WeekDataResponse.model_validate(wd)

    async def create(
        self,
        user_id: int,
        project_id: int,
        year: int,
        month: int,
        data: WeekDataUpdate,
        *,
        bypass_lock: bool = False,
    ) -> WeekDataResponse:
        await self._ensure_unlocked(user_id, bypass_lock=bypass_lock)
        wd = WeekData(
            user_id=user_id,
            project_id=project_id,
            year=year,
            month=month,
            week1=data.week1,
            week2=data.week2,
            week3=data.week3,
            week4=data.week4,
            week5=data.week5,
        )
        self._db.add(wd)
        await self._db.flush()
        await self._db.refresh(wd)
        return WeekDataResponse.model_validate(wd)

    async def upsert(
        self,
        user_id: int,
        project_id: int,
        year: int,
        month: int,
        data: WeekDataUpdate,
        *,
        bypass_lock: bool = False,
    ) -> WeekDataResponse:
        await self._ensure_unlocked(user_id, bypass_lock=bypass_lock)
        wd = await self._find(user_id, project_id, year, month)
        if wd is None:
            return await self.create(
                user_id, project_id, year, month, data, bypass_lock=True
            )

        wd.week1 = data.week1
        wd.week2 = data.week2
        wd.week3 = data.week3
        wd.week4 = data.week4
        if data.week5 is not None:
            wd.week5 = data.week5
        await self._db.flush()
        await self._db.refresh(wd)
        return WeekDataResponse.model_validate(wd)

    async def delete(
        self,
        user_id: int,
        project_id: int,
        year: int,
        month: int,
        *,
        bypass_lock: bool = False,
    ) -> WeekDataResponse:
        await self._ensure_unlocked(user_id, bypass_lock=bypass_lock)
        wd = await self._find(user_id, project_id, year, month)
        if wd is None:
            raise RecordNotFoundException(
                f"WeekData not found for user {user_id}, project {project_id}, {year}/{month}"
            )
        response = WeekDataResponse.model_validate(wd)
        await self._db.delete(wd)
        await self._db.flush()
        return response

    async def reset(self) -> MessageResponse:
        await self._db.execute(delete(WeekData))
        await self._db.flush()
        return MessageResponse(message="WeekData table reset successfully.")

    async def _find(self, user_id: int, project_id: int, year: int, month: int) -> WeekData | None:
        result = await self._db.execute(
            select(WeekData).where(
                WeekData.user_id == user_id,
                WeekData.project_id == project_id,
                WeekData.year == year,
                WeekData.month == month,
            )
        )
        return result.scalar_one_or_none()

    async def _ensure_unlocked(self, user_id: int, *, bypass_lock: bool) -> None:
        if bypass_lock:
            return
        # Admin UI toggles the global (department=None, region=None) lock key.
        if await DashboardService(self._db).get_lock(None, None):
            raise OperationNotSupportedException(
                "Timesheet is locked. Contact an administrator to unlock it."
            )
        # Keep user lookup so callers fail clearly if the user_id is invalid.
        user = (
            await self._db.execute(select(User).where(User.id == user_id))
        ).scalar_one_or_none()
        if user is None:
            raise RecordNotFoundException(f"User {user_id} not found")
