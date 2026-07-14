from datetime import date

from fastapi import APIRouter, Query, Request

from app.core.deps import (
    AdminOrDeveloper,
    AllAuthenticated,
    CurrentUser,
    DbSession,
    ManagementAndAbove,
    SelfOrAdminUserId,
    assert_self_or_admin,
    role_from_payload,
)
from app.core.rate_limit import limiter
from app.models.enums import Role
from app.schemas.common import MessageResponse
from app.schemas.leave import LeaveCreate, LeaveResponse
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leave", tags=["leaves"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[LeaveResponse], dependencies=[ManagementAndAbove])
async def get_all(db: DbSession, date: date | None = Query(default=None)) -> list[LeaveResponse]:
    return await LeaveService(db).get_all(date)


@router.get(
    "/{year}/{month}/{user_id}",
    response_model=list[LeaveResponse],
    dependencies=[SelfOrAdminUserId],
)
async def get_by_period(year: int, month: int, user_id: int, db: DbSession) -> list[LeaveResponse]:
    return await LeaveService(db).get_by_period(year, month, user_id)


@router.get("/{user_id}", response_model=list[LeaveResponse], dependencies=[SelfOrAdminUserId])
async def get_by_user(
    user_id: int, db: DbSession, date: date | None = Query(default=None)
) -> list[LeaveResponse]:
    return await LeaveService(db).get_by_user(user_id, date)


@router.post("", response_model=LeaveResponse, status_code=201)
async def create(body: LeaveCreate, db: DbSession, payload: CurrentUser) -> LeaveResponse:
    assert_self_or_admin(payload, body.user_id)
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await LeaveService(db).create(body, bypass_lock=bypass_lock)


@router.post("/add", response_model=MessageResponse, status_code=201)
async def create_bulk(body: list[LeaveCreate], db: DbSession, payload: CurrentUser) -> MessageResponse:
    for item in body:
        assert_self_or_admin(payload, item.user_id)
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await LeaveService(db).create_bulk(body, bypass_lock=bypass_lock)


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
@limiter.limit("5/minute")
async def reset(request: Request, db: DbSession) -> MessageResponse:
    return await LeaveService(db).reset()


@router.delete("/{user_id}", response_model=MessageResponse, dependencies=[SelfOrAdminUserId])
async def delete(
    user_id: int, date: date, db: DbSession, payload: CurrentUser
) -> MessageResponse:
    bypass_lock = role_from_payload(payload) in (Role.Admin, Role.Developer)
    return await LeaveService(db).delete(date, user_id, bypass_lock=bypass_lock)
