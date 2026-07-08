from datetime import date

from fastapi import APIRouter, Query

from app.core.deps import AllAuthenticated, DbSession
from app.schemas.common import MessageResponse
from app.schemas.leave import LeaveCreate, LeaveResponse
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leave", tags=["leaves"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[LeaveResponse])
async def get_all(db: DbSession, date: date | None = Query(default=None)) -> list[LeaveResponse]:
    return await LeaveService(db).get_all(date)


@router.get("/{year}/{month}/{user_id}", response_model=list[LeaveResponse])
async def get_by_period(year: int, month: int, user_id: int, db: DbSession) -> list[LeaveResponse]:
    return await LeaveService(db).get_by_period(year, month, user_id)


@router.get("/{user_id}", response_model=list[LeaveResponse])
async def get_by_user(user_id: int, db: DbSession, date: date | None = Query(default=None)) -> list[LeaveResponse]:
    return await LeaveService(db).get_by_user(user_id, date)


@router.post("", response_model=LeaveResponse, status_code=201)
async def create(body: LeaveCreate, db: DbSession) -> LeaveResponse:
    return await LeaveService(db).create(body)


@router.post("/add", response_model=MessageResponse, status_code=201)
async def create_bulk(body: list[LeaveCreate], db: DbSession) -> MessageResponse:
    return await LeaveService(db).create_bulk(body)


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete(user_id: int, date: date, db: DbSession) -> MessageResponse:
    return await LeaveService(db).delete(date, user_id)


@router.delete("/reset", response_model=MessageResponse)
async def reset(db: DbSession) -> MessageResponse:
    return await LeaveService(db).reset()
