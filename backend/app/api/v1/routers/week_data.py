from fastapi import APIRouter

from app.core.deps import (
    AdminOrDeveloper,
    AllAuthenticated,
    CurrentUser,
    DbSession,
    ManagementAndAbove,
    SelfOrAdminUserId,
    role_from_payload,
)
from app.models.enums import Role
from app.schemas.common import MessageResponse
from app.schemas.week_data import WeekDataResponse, WeekDataUpdate
from app.services.week_data_service import WeekDataService

router = APIRouter(prefix="/weekData", tags=["weekdata"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[WeekDataResponse], dependencies=[ManagementAndAbove])
async def get_all(db: DbSession) -> list[WeekDataResponse]:
    rows = await WeekDataService(db).get_all()
    return [WeekDataResponse.model_validate(r) for r in rows]


@router.get("/{year}/{month}", response_model=list[WeekDataResponse], dependencies=[ManagementAndAbove])
async def get_by_period(year: int, month: int, db: DbSession) -> list[WeekDataResponse]:
    rows = await WeekDataService(db).get_by_period(year, month)
    return [WeekDataResponse.model_validate(r) for r in rows]


@router.get(
    "/{user_id}/{project_id}/{year}/{month}",
    response_model=WeekDataResponse,
    dependencies=[SelfOrAdminUserId],
)
async def get_by_key(
    user_id: int, project_id: int, year: int, month: int, db: DbSession
) -> WeekDataResponse:
    return await WeekDataService(db).get_by_key(user_id, project_id, year, month)


@router.post(
    "/{user_id}/{project_id}/{year}/{month}",
    response_model=WeekDataResponse,
    status_code=201,
    dependencies=[SelfOrAdminUserId],
)
async def create(
    user_id: int,
    project_id: int,
    year: int,
    month: int,
    body: WeekDataUpdate,
    db: DbSession,
    payload: CurrentUser,
) -> WeekDataResponse:
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await WeekDataService(db).create(
        user_id, project_id, year, month, body, bypass_lock=bypass_lock
    )


@router.put(
    "/{user_id}/{project_id}/{year}/{month}",
    response_model=WeekDataResponse,
    dependencies=[SelfOrAdminUserId],
)
async def upsert(
    user_id: int,
    project_id: int,
    year: int,
    month: int,
    body: WeekDataUpdate,
    db: DbSession,
    payload: CurrentUser,
) -> WeekDataResponse:
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await WeekDataService(db).upsert(
        user_id, project_id, year, month, body, bypass_lock=bypass_lock
    )


@router.delete(
    "/{user_id}/{project_id}/{year}/{month}",
    response_model=WeekDataResponse,
    dependencies=[SelfOrAdminUserId],
)
async def delete(
    user_id: int,
    project_id: int,
    year: int,
    month: int,
    db: DbSession,
    payload: CurrentUser,
) -> WeekDataResponse:
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await WeekDataService(db).delete(
        user_id, project_id, year, month, bypass_lock=bypass_lock
    )


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset(db: DbSession) -> MessageResponse:
    return await WeekDataService(db).reset()
