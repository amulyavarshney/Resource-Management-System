from fastapi import APIRouter, Query

from app.core.deps import AllAuthenticated, DbSession, ManagementAndAbove
from app.models.enums import Department, Region
from app.schemas.common import MessageResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/lock", tags=["lock"], dependencies=[AllAuthenticated])


@router.get("", response_model=bool)
async def get_lock(
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> bool:
    return await DashboardService(db).get_lock(department, region)


@router.post("", response_model=MessageResponse, dependencies=[ManagementAndAbove])
async def set_lock(
    is_locked: bool,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> MessageResponse:
    await DashboardService(db).set_lock(is_locked, department, region)
    return MessageResponse(message=f"Lock changed to {is_locked}")
