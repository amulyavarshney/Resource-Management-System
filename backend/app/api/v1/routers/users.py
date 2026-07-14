from datetime import datetime

from fastapi import APIRouter, Query, Request, UploadFile

from app.core.deps import (
    AdminOrDeveloper,
    AllAuthenticated,
    CurrentUser,
    DbSession,
    ManagementAndAbove,
    SelfOnly,
    SelfOrAdmin,
)
from app.core.rate_limit import limiter
from app.models.enums import Department, Region, Role
from app.schemas.common import MessageResponse
from app.schemas.user import PasswordChange, PasswordRemove, UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService


def _is_admin(payload: dict) -> bool:
    try:
        return Role[payload.get("Role", "")] in (Role.Admin, Role.Developer)
    except KeyError:
        return False


router = APIRouter(prefix="/user", tags=["users"], dependencies=[AllAuthenticated])


@router.get("/me", response_model=UserResponse)
async def get_me(db: DbSession, caller: CurrentUser) -> UserResponse:
    return await UserService(db).get_by_id(int(caller["id"]))


@router.get("", response_model=list[UserResponse], dependencies=[ManagementAndAbove])
async def get_users(
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_all(department, region)


@router.get("/managers", response_model=list[UserResponse])
async def get_managers(
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_managers(department, region)


@router.get(
    "/{year}/{month}",
    response_model=list[UserResponse],
    dependencies=[ManagementAndAbove],
)
async def get_users_for_period(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_all_for_period(year, month, department, region)


@router.get(
    "/{year}/{month}/parent/{parent_id}",
    response_model=list[UserResponse],
    dependencies=[ManagementAndAbove],
)
async def get_users_under_parent(
    year: int,
    month: int,
    parent_id: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_all_for_period(
        year, month, department, region, parent_id=parent_id
    )


@router.get("/{id}", response_model=UserResponse, dependencies=[SelfOrAdmin])
async def get_user(id: int, db: DbSession) -> UserResponse:
    return await UserService(db).get_by_id(id)


@router.post("", response_model=UserResponse, status_code=201, dependencies=[AdminOrDeveloper])
async def create_user(body: UserCreate, db: DbSession) -> UserResponse:
    return await UserService(db).create(body)


@router.post("/import", response_model=MessageResponse, status_code=201, dependencies=[AdminOrDeveloper])
@limiter.limit("10/minute")
async def import_users(request: Request, excelFile: UploadFile, db: DbSession) -> MessageResponse:
    return await UserService(db).import_from_excel(excelFile)


@router.patch("/{id}", response_model=UserResponse, dependencies=[SelfOrAdmin])
async def update_user(id: int, body: UserUpdate, db: DbSession, caller: CurrentUser) -> UserResponse:
    return await UserService(db).update(id, body, caller_is_admin=_is_admin(caller))


@router.patch("/{id}/lastSavedTime", response_model=UserResponse, dependencies=[SelfOrAdmin])
async def update_last_saved_time(id: int, last_saved_time: datetime, db: DbSession) -> UserResponse:
    return await UserService(db).update_last_saved_time(id, last_saved_time)


@router.patch("/{id}/changePassword", response_model=MessageResponse, dependencies=[SelfOrAdmin])
@limiter.limit("10/minute")
async def change_password(
    request: Request,
    id: int,
    body: PasswordChange,
    db: DbSession,
    caller: CurrentUser,
) -> MessageResponse:
    is_self = str(caller.get("id")) == str(id)
    return await UserService(db).change_password(id, body, is_self=is_self)


@router.patch("/{id}/removePassword", response_model=MessageResponse, dependencies=[SelfOnly])
async def remove_password(id: int, body: PasswordRemove, db: DbSession) -> MessageResponse:
    return await UserService(db).remove_password(id, body.password)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def delete_user(
    id: int,
    db: DbSession,
    delete_now: bool | None = Query(default=None),
) -> MessageResponse:
    return await UserService(db).delete(id, delete_now)


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
@limiter.limit("5/minute")
async def reset_users(request: Request, db: DbSession) -> MessageResponse:
    return await UserService(db).reset()
