from datetime import date, datetime

from fastapi import UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    DuplicateEntityException,
    OperationNotSupportedException,
    RecordNotFoundException,
)
from app.models.enums import HolidayType, Region
from app.models.holiday import Holiday, PersonalHoliday
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.holiday import HolidayCreate, HolidayResponse, HolidayUpdate
from app.utils.enum_utils import parse_by_name_or_description
from app.utils.excel_utils import read_excel


class HolidayService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------ GET all

    async def get_all_company(self, region: Region | None) -> list[Holiday]:
        stmt = select(Holiday)
        if region is not None:
            stmt = stmt.where((Holiday.region.op("&")(int(region))) > 0)
        return list((await self._db.execute(stmt)).scalars().all())

    async def get_all_personal(self, user_id: int | None, region: Region | None) -> list[PersonalHoliday]:
        stmt = select(PersonalHoliday).options(selectinload(PersonalHoliday.user))
        if user_id is not None:
            stmt = stmt.where(PersonalHoliday.user_id == user_id)
        if region is not None:
            stmt = stmt.join(PersonalHoliday.user).where((User.region.op("&")(int(region))) > 0)
        return list((await self._db.execute(stmt)).scalars().all())

    async def get_by_year(self, year: int, user_id: int | None, region: Region | None) -> list[Holiday]:
        stmt = select(Holiday).where(Holiday.date.between(date(year, 1, 1), date(year, 12, 31)))
        if region is not None:
            stmt = stmt.where((Holiday.region.op("&")(int(region))) > 0)
        holidays = list((await self._db.execute(stmt)).scalars().all())

        if user_id is not None:
            holidays = await self._apply_personal_overrides_year(holidays, user_id, year, region)
        return sorted(holidays, key=lambda h: h.date)

    async def get_by_month(self, year: int, month: int, user_id: int | None, region: Region | None) -> list[Holiday]:
        from calendar import monthrange
        last_day = monthrange(year, month)[1]
        stmt = select(Holiday).where(Holiday.date.between(date(year, month, 1), date(year, month, last_day)))
        if region is not None:
            stmt = stmt.where((Holiday.region.op("&")(int(region))) > 0)
        holidays = list((await self._db.execute(stmt)).scalars().all())

        if user_id is not None:
            holidays = await self._apply_personal_overrides_month(holidays, user_id, year, month, region)
        return holidays

    async def get_one(self, dt: date, user_id: int | None, region: Region | None) -> HolidayResponse:
        # Check personal holiday first
        ph_stmt = select(PersonalHoliday).options(selectinload(PersonalHoliday.user)).where(
            PersonalHoliday.date == dt,
            PersonalHoliday.user_id == user_id,
        )
        ph = (await self._db.execute(ph_stmt)).scalar_one_or_none()
        if ph is not None:
            if ph.show:
                return HolidayResponse(date=ph.date, name=ph.name, type=ph.type, user_id=ph.user_id, show=ph.show)
            raise RecordNotFoundException(f"Could not find any holiday with date: {dt}")

        stmt = select(Holiday).where(Holiday.date == dt)
        if region is not None:
            stmt = stmt.where((Holiday.region.op("&")(int(region))) > 0)
        h = (await self._db.execute(stmt)).scalars().first()
        if h is None:
            raise RecordNotFoundException(f"Could not find any holiday with date: {dt}")
        return HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region)

    # ------------------------------------------------------------------ CREATE

    async def create(self, data: HolidayCreate) -> HolidayResponse:
        if data.user_id is None and data.region is None:
            raise OperationNotSupportedException("Either user_id or region is required.")
        if data.user_id is not None and data.region is not None:
            raise OperationNotSupportedException("user_id and region cannot be used together.")

        if data.user_id is not None:
            existing = await self._db.execute(
                select(PersonalHoliday).where(PersonalHoliday.date == data.date, PersonalHoliday.user_id == data.user_id)
            )
            if existing.scalar_one_or_none():
                raise DuplicateEntityException(f"Holiday on {data.date} already exists.")
            ph = PersonalHoliday(date=data.date, name=data.name, type=int(data.type), user_id=data.user_id, show=True)
            self._db.add(ph)
            await self._db.flush()
            return HolidayResponse(date=ph.date, name=ph.name, type=ph.type, user_id=ph.user_id, show=ph.show)

        existing = await self._db.execute(
            select(Holiday).where(Holiday.date == data.date)
        )
        if existing.scalar_one_or_none():
            raise DuplicateEntityException(f"Holiday on {data.date} already exists.")
        h = Holiday(date=data.date, name=data.name, type=int(data.type), region=int(data.region))  # type: ignore[arg-type]
        self._db.add(h)
        await self._db.flush()
        return HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region)

    # ------------------------------------------------------------------ UPDATE

    async def update_company(self, dt: date, region: Region, data: HolidayUpdate) -> HolidayResponse:
        stmt = select(Holiday).where(Holiday.date == dt, (Holiday.region.op("&")(int(region))) > 0)
        h = (await self._db.execute(stmt)).scalar_one_or_none()
        if h is None:
            raise RecordNotFoundException(f"Could not find any holiday with date: {dt}")
        if data.name is not None:
            h.name = data.name
        if data.type is not None:
            h.type = int(data.type)
        if data.region is not None:
            h.region = int(data.region)
        await self._db.flush()
        return HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region)

    async def update_personal(self, dt: date, user_id: int, data: HolidayUpdate) -> HolidayResponse:
        stmt = select(PersonalHoliday).where(PersonalHoliday.date == dt, PersonalHoliday.user_id == user_id)
        ph = (await self._db.execute(stmt)).scalar_one_or_none()
        if ph is None:
            raise RecordNotFoundException(f"Could not find personal holiday with date: {dt} for user {user_id}")
        if data.name is not None:
            ph.name = data.name
        if data.type is not None:
            ph.type = int(data.type)
        if data.user_id is not None:
            ph.user_id = data.user_id
        if data.show is not None:
            ph.show = data.show
        await self._db.flush()
        return HolidayResponse(date=ph.date, name=ph.name, type=ph.type, user_id=ph.user_id, show=ph.show)

    # ------------------------------------------------------------------ DELETE

    async def delete(self, dt: date, user_id: int | None, region: Region | None) -> MessageResponse:
        if user_id is not None:
            ph_stmt = select(PersonalHoliday).where(PersonalHoliday.date == dt, PersonalHoliday.user_id == user_id)
            ph = (await self._db.execute(ph_stmt)).scalar_one_or_none()
            if ph is not None:
                await self._db.delete(ph)
            else:
                h_stmt = select(Holiday).where(Holiday.date == dt)
                if region is not None:
                    h_stmt = h_stmt.where((Holiday.region.op("&")(int(region))) > 0)
                h = (await self._db.execute(h_stmt)).scalar_one_or_none()
                if h is None:
                    raise RecordNotFoundException(f"Could not find any holiday with date: {dt}")
                new_ph = PersonalHoliday(date=h.date, name=h.name, type=h.type, user_id=user_id, show=False)
                self._db.add(new_ph)
        else:
            h_stmt = select(Holiday).where(Holiday.date == dt)
            if region is not None:
                h_stmt = h_stmt.where((Holiday.region.op("&")(int(region))) > 0)
            h = (await self._db.execute(h_stmt)).scalar_one_or_none()
            if h is None:
                raise RecordNotFoundException(f"Could not find any holiday with date: {dt}")
            await self._db.delete(h)
        await self._db.flush()
        user_part = f" for user with id: {user_id}" if user_id is not None else ""
        return MessageResponse(message=f"Holiday on date {dt}{user_part} is deleted successfully.")

    async def reset_company(self) -> MessageResponse:
        await self._db.execute(delete(Holiday))
        await self._db.flush()
        return MessageResponse(message="Holidays table reset successfully.")

    async def reset_personal(self) -> MessageResponse:
        await self._db.execute(delete(PersonalHoliday))
        await self._db.flush()
        return MessageResponse(message="Personal Holidays table reset successfully.")

    async def reset_all(self) -> MessageResponse:
        await self._db.execute(delete(PersonalHoliday))
        await self._db.execute(delete(Holiday))
        await self._db.flush()
        return MessageResponse(message="Holidays and Personal Holidays table reset successfully.")

    # ------------------------------------------------------------------ import

    async def import_company_from_excel(self, file: UploadFile) -> MessageResponse:
        rows = await read_excel(file)
        for row in rows:
            self._db.add(Holiday(
                date=_parse_row_date(row["Date"]),
                name=str(row["Name"]),
                type=int(_parse_holiday_type(row["Type"])),
                region=int(_parse_region(row["Region"])),
            ))
        await self._db.flush()
        return MessageResponse(message="Holidays imported successfully.")

    async def import_personal_from_excel(self, file: UploadFile) -> MessageResponse:
        rows = await read_excel(file)
        for row in rows:
            self._db.add(PersonalHoliday(
                date=_parse_row_date(row["Date"]),
                name=str(row["Name"]),
                type=int(_parse_holiday_type(row["Type"])),
                user_id=int(row["UserId"]),
                show=bool(row["Show"]),
            ))
        await self._db.flush()
        return MessageResponse(message="Personal Holidays imported successfully.")

    # ------------------------------------------------------------------ helpers

    async def _apply_personal_overrides_year(
        self, holidays: list[Holiday], user_id: int, year: int, region: Region | None
    ) -> list[Holiday]:
        ph_stmt = select(PersonalHoliday).options(selectinload(PersonalHoliday.user)).where(
            PersonalHoliday.user_id == user_id,
            PersonalHoliday.date.between(date(year, 1, 1), date(year, 12, 31)),
        )
        phs = list((await self._db.execute(ph_stmt)).scalars().all())
        for ph in phs:
            if ph.show:
                holidays.append(Holiday(date=ph.date, name=ph.name, type=ph.type, region=ph.user.region))
            else:
                holidays = [h for h in holidays if not (h.date == ph.date and (region is None or (h.region & int(region))))]
        return holidays

    async def _apply_personal_overrides_month(
        self, holidays: list[Holiday], user_id: int, year: int, month: int, region: Region | None
    ) -> list[Holiday]:
        from calendar import monthrange
        last_day = monthrange(year, month)[1]
        ph_stmt = select(PersonalHoliday).options(selectinload(PersonalHoliday.user)).where(
            PersonalHoliday.user_id == user_id,
            PersonalHoliday.date.between(date(year, month, 1), date(year, month, last_day)),
        )
        phs = list((await self._db.execute(ph_stmt)).scalars().all())
        for ph in phs:
            if ph.show:
                holidays.append(Holiday(date=ph.date, name=ph.name, type=ph.type, region=ph.user.region))
            else:
                holidays = [h for h in holidays if h.date != ph.date]
        return holidays


def _parse_row_date(value: object) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value))


def _parse_holiday_type(value: object) -> HolidayType:
    if isinstance(value, int):
        return HolidayType(value)
    return parse_by_name_or_description(HolidayType, str(value))


def _parse_region(value: object) -> Region:
    if isinstance(value, int):
        return Region(value)
    return parse_by_name_or_description(Region, str(value))
