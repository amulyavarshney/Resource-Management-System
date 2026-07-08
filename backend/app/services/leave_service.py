from datetime import date

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DuplicateEntityException, OperationNotSupportedException
from app.models.enums import LeaveSession, LeaveType
from app.models.holiday import Holiday
from app.models.leave import Leave
from app.schemas.common import MessageResponse
from app.schemas.leave import LeaveCreate, LeaveResponse
from app.utils.enum_utils import parse_by_name_or_description


class LeaveService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self, dt: date | None) -> list[LeaveResponse]:
        stmt = select(Leave)
        if dt is not None:
            stmt = stmt.where(Leave.date == dt)
        rows = list((await self._db.execute(stmt)).scalars().all())
        return [LeaveResponse.model_validate(r) for r in rows]

    async def get_by_user(self, user_id: int, dt: date | None) -> list[LeaveResponse]:
        stmt = select(Leave).where(Leave.user_id == user_id)
        if dt is not None:
            stmt = stmt.where(Leave.date == dt)
        rows = list((await self._db.execute(stmt)).scalars().all())
        return [LeaveResponse.model_validate(r) for r in rows]

    async def get_by_period(self, year: int, month: int, user_id: int) -> list[LeaveResponse]:
        from calendar import monthrange
        last_day = monthrange(year, month)[1]
        stmt = select(Leave).where(
            Leave.user_id == user_id,
            Leave.date.between(date(year, month, 1), date(year, month, last_day)),
        )
        rows = list((await self._db.execute(stmt)).scalars().all())
        return [LeaveResponse.model_validate(r) for r in rows]

    async def create(self, data: LeaveCreate) -> LeaveResponse:
        leave_type = parse_by_name_or_description(LeaveType, data.type)
        leave_session = parse_by_name_or_description(LeaveSession, data.session)

        await self._validate_leave_date(data.date)

        stmt = select(Leave).where(Leave.date == data.date, Leave.user_id == data.user_id)
        existing = (await self._db.execute(stmt)).scalar_one_or_none()
        if existing is not None:
            existing.type = int(leave_type)
            existing.session = int(leave_session)
            await self._db.flush()
            await self._db.refresh(existing)
            return LeaveResponse.model_validate(existing)

        leave = Leave(date=data.date, type=int(leave_type), session=int(leave_session), user_id=data.user_id)
        self._db.add(leave)
        await self._db.flush()
        await self._db.refresh(leave)
        return LeaveResponse.model_validate(leave)

    async def create_bulk(self, leaves: list[LeaveCreate]) -> MessageResponse:
        for data in leaves:
            await self.create(data)
        return MessageResponse(message="Leaves added successfully.")

    async def delete(self, dt: date, user_id: int) -> MessageResponse:
        stmt = select(Leave).where(Leave.date == dt, Leave.user_id == user_id)
        leave = (await self._db.execute(stmt)).scalar_one_or_none()
        if leave is None:
            from app.core.exceptions import RecordNotFoundException
            raise RecordNotFoundException(f"Could not find leave for date {dt} and user {user_id}")
        await self._db.delete(leave)
        await self._db.flush()
        return MessageResponse(message=f"Leave on date {dt} for user with userId {user_id} is deleted successfully.")

    async def reset(self) -> MessageResponse:
        await self._db.execute(delete(Leave))
        await self._db.flush()
        return MessageResponse(message="Leaves table reset successfully.")

    async def _validate_leave_date(self, dt: date) -> None:
        if dt.weekday() in (5, 6):  # Saturday=5, Sunday=6
            raise OperationNotSupportedException("Invalid Day: Can't apply leave on Weekend.")
        holiday_stmt = select(Holiday).where(Holiday.date == dt)
        holiday = (await self._db.execute(holiday_stmt)).scalar_one_or_none()
        if holiday is not None:
            raise OperationNotSupportedException("Invalid Day: Can't apply leave on Holiday.")
