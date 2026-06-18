from datetime import datetime

from fastapi import APIRouter, Query

from app.core.deps import AllAuthenticated, DbSession
from app.models.enums import Department, Region
from app.schemas.common import MessageResponse
from app.schemas.user import PasswordChange, UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/user", tags=["users"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[UserResponse])
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


@router.get("/{year}/{month}", response_model=list[UserResponse])
async def get_users_for_period(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_all_for_period(year, month, department, region)


@router.get("/{year}/{month}/parent/{parent_id}", response_model=list[UserResponse])
async def get_users_under_parent(
    year: int,
    month: int,
    parent_id: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserResponse]:
    return await UserService(db).get_all_for_period(year, month, department, region, parent_id=parent_id)


@router.get("/{id}", response_model=UserResponse)
async def get_user(id: int, db: DbSession) -> UserResponse:
    return await UserService(db).get_by_id(id)


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(body: UserCreate, db: DbSession) -> UserResponse:
    return await UserService(db).create(body)


@router.patch("/{id}", response_model=UserResponse)
async def update_user(id: int, body: UserUpdate, db: DbSession) -> UserResponse:
    return await UserService(db).update(id, body)


@router.patch("/{id}/lastSavedTime", response_model=UserResponse)
async def update_last_saved_time(id: int, last_saved_time: datetime, db: DbSession) -> UserResponse:
    return await UserService(db).update_last_saved_time(id, last_saved_time)


@router.patch("/{id}/changePassword", response_model=MessageResponse)
async def change_password(id: int, body: PasswordChange, db: DbSession) -> MessageResponse:
    return await UserService(db).change_password(id, body)


@router.patch("/{id}/removePassword", response_model=MessageResponse)
async def remove_password(id: int, password: str, db: DbSession) -> MessageResponse:
    return await UserService(db).remove_password(id, password)


@router.delete("/{id}", response_model=MessageResponse)
async def delete_user(
    id: int,
    db: DbSession,
    delete_now: bool | None = Query(default=None),
) -> MessageResponse:
    return await UserService(db).delete(id, delete_now)


@router.delete("/reset", response_model=MessageResponse)
async def reset_users(db: DbSession) -> MessageResponse:
    return await UserService(db).reset()
