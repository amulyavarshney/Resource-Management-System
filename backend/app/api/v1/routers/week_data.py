from fastapi import APIRouter

from app.core.deps import AdminOrDeveloper, AllAuthenticated, DbSession
from app.schemas.common import MessageResponse
from app.schemas.week_data import WeekDataResponse, WeekDataUpdate
from app.services.week_data_service import WeekDataService

router = APIRouter(prefix="/weekData", tags=["weekdata"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[WeekDataResponse])
async def get_all(db: DbSession) -> list[WeekDataResponse]:
    rows = await WeekDataService(db).get_all()
    return [WeekDataResponse.model_validate(r) for r in rows]


@router.get("/{year}/{month}", response_model=list[WeekDataResponse])
async def get_by_period(year: int, month: int, db: DbSession) -> list[WeekDataResponse]:
    rows = await WeekDataService(db).get_by_period(year, month)
    return [WeekDataResponse.model_validate(r) for r in rows]


@router.get("/{user_id}/{project_id}/{year}/{month}", response_model=WeekDataResponse)
async def get_by_key(user_id: int, project_id: int, year: int, month: int, db: DbSession) -> WeekDataResponse:
    return await WeekDataService(db).get_by_key(user_id, project_id, year, month)


@router.post("/{user_id}/{project_id}/{year}/{month}", response_model=WeekDataResponse, status_code=201)
async def create(user_id: int, project_id: int, year: int, month: int, body: WeekDataUpdate, db: DbSession) -> WeekDataResponse:
    return await WeekDataService(db).create(user_id, project_id, year, month, body)


@router.put("/{user_id}/{project_id}/{year}/{month}", response_model=WeekDataResponse)
async def upsert(user_id: int, project_id: int, year: int, month: int, body: WeekDataUpdate, db: DbSession) -> WeekDataResponse:
    return await WeekDataService(db).upsert(user_id, project_id, year, month, body)


@router.delete("/{user_id}/{project_id}/{year}/{month}", response_model=WeekDataResponse)
async def delete(user_id: int, project_id: int, year: int, month: int, db: DbSession) -> WeekDataResponse:
    return await WeekDataService(db).delete(user_id, project_id, year, month)


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset(db: DbSession) -> MessageResponse:
    return await WeekDataService(db).reset()
