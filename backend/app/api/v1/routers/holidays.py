from datetime import date

from fastapi import APIRouter, Query, UploadFile

from app.core.deps import AdminOrDeveloper, AllAuthenticated, DbSession
from app.models.enums import Region
from app.schemas.common import MessageResponse
from app.schemas.holiday import HolidayCreate, HolidayResponse, HolidayUpdate
from app.services.holiday_service import HolidayService

router = APIRouter(prefix="/holiday", tags=["holidays"], dependencies=[AllAuthenticated])


@router.get("/all", response_model=list[HolidayResponse])
async def get_all_company(db: DbSession, region: Region | None = Query(default=None)) -> list[HolidayResponse]:
    holidays = await HolidayService(db).get_all_company(region)
    return [HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region) for h in holidays]


@router.get("/personal", response_model=list[HolidayResponse])
async def get_all_personal(
    db: DbSession,
    user_id: int | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[HolidayResponse]:
    phs = await HolidayService(db).get_all_personal(user_id, region)
    return [HolidayResponse(date=ph.date, name=ph.name, type=ph.type, user_id=ph.user_id, show=ph.show) for ph in phs]


@router.get("/{year}/{month}", response_model=list[HolidayResponse])
async def get_by_month(
    year: int,
    month: int,
    db: DbSession,
    user_id: int | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[HolidayResponse]:
    holidays = await HolidayService(db).get_by_month(year, month, user_id, region)
    return [HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region) for h in holidays]


@router.get("/{year}", response_model=list[HolidayResponse])
async def get_by_year(
    year: int,
    db: DbSession,
    user_id: int | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[HolidayResponse]:
    holidays = await HolidayService(db).get_by_year(year, user_id, region)
    return [HolidayResponse(date=h.date, name=h.name, type=h.type, region=h.region) for h in holidays]


@router.get("", response_model=HolidayResponse)
async def get_one(
    date: date,
    db: DbSession,
    user_id: int | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> HolidayResponse:
    return await HolidayService(db).get_one(date, user_id, region)


@router.post("", response_model=HolidayResponse, status_code=201)
async def create(body: HolidayCreate, db: DbSession) -> HolidayResponse:
    return await HolidayService(db).create(body)


@router.post("/importHolidays", response_model=MessageResponse, status_code=201, dependencies=[AdminOrDeveloper])
async def import_holidays(excelFile: UploadFile, db: DbSession) -> MessageResponse:
    return await HolidayService(db).import_company_from_excel(excelFile)


@router.post("/importPersonalHolidays", response_model=MessageResponse, status_code=201, dependencies=[AdminOrDeveloper])
async def import_personal_holidays(excelFile: UploadFile, db: DbSession) -> MessageResponse:
    return await HolidayService(db).import_personal_from_excel(excelFile)


@router.patch("", response_model=HolidayResponse)
async def update_company(
    date: date,
    region: Region,
    body: HolidayUpdate,
    db: DbSession,
) -> HolidayResponse:
    return await HolidayService(db).update_company(date, region, body)


@router.patch("/{user_id}", response_model=HolidayResponse)
async def update_personal(
    user_id: int,
    date: date,
    body: HolidayUpdate,
    db: DbSession,
) -> HolidayResponse:
    return await HolidayService(db).update_personal(date, user_id, body)


@router.delete("", response_model=MessageResponse)
async def delete(
    date: date,
    db: DbSession,
    user_id: int | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> MessageResponse:
    return await HolidayService(db).delete(date, user_id, region)


@router.delete("/resetHolidays", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset_holidays(db: DbSession) -> MessageResponse:
    return await HolidayService(db).reset_company()


@router.delete("/resetPersonalHolidays", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset_personal_holidays(db: DbSession) -> MessageResponse:
    return await HolidayService(db).reset_personal()


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset_all(db: DbSession) -> MessageResponse:
    return await HolidayService(db).reset_all()
