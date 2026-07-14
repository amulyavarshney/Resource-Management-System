from fastapi import APIRouter, Query

from app.core.deps import DbSession, ManagementAndAbove
from app.models.enums import Department, Region
from app.schemas.dashboard import DashboardResponse, ProjectDashboardResponse, UserDashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[ManagementAndAbove])

# ── Static-prefix routes MUST come before parametric /{year}/{month} routes ──

@router.get("/project/{project_id}", response_model=ProjectDashboardResponse)
async def get_project_dashboard(project_id: int, db: DbSession) -> ProjectDashboardResponse:
    return await DashboardService(db).get_project_dashboard(project_id)


@router.get("/user/{user_id}", response_model=UserDashboardResponse)
async def get_user_dashboard(user_id: int, db: DbSession) -> UserDashboardResponse:
    return await DashboardService(db).get_user_dashboard(user_id)


# ── Parametric /{year}/{month} routes ─────────────────────────────────────────

@router.get("/{year}/{month}", response_model=DashboardResponse)
async def get_dashboard(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> DashboardResponse:
    return await DashboardService(db).get_dashboard(year, month, department, region)


@router.get("/{year}/{month}/project", response_model=list[ProjectDashboardResponse])
async def get_all_project_dashboards(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[ProjectDashboardResponse]:
    return await DashboardService(db).get_all_project_dashboards(year, month, department, region)


@router.get("/{year}/{month}/project/{project_id}", response_model=ProjectDashboardResponse)
async def get_project_dashboard_for_period(
    year: int, month: int, project_id: int, db: DbSession
) -> ProjectDashboardResponse:
    return await DashboardService(db).get_project_dashboard_for_period(year, month, project_id)


@router.get("/{year}/{month}/user", response_model=list[UserDashboardResponse])
async def get_all_user_dashboards(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserDashboardResponse]:
    return await DashboardService(db).get_all_user_dashboards(year, month, department, region)


@router.get("/{year}/{month}/user/{user_id}", response_model=UserDashboardResponse)
async def get_user_dashboard_for_period(
    year: int, month: int, user_id: int, db: DbSession
) -> UserDashboardResponse:
    return await DashboardService(db).get_user_dashboard_for_period(year, month, user_id)


@router.get("/{year}/{month}/parent/{parent_id}", response_model=list[UserDashboardResponse])
async def get_user_dashboard_under_parent(
    year: int,
    month: int,
    parent_id: int,
    db: DbSession,
    region: Region | None = Query(default=None),
) -> list[UserDashboardResponse]:
    return await DashboardService(db).get_user_dashboard_under_parent(year, month, parent_id, region)


@router.get("/{year}/{month}/users-with-unfilled-timesheet", response_model=list[UserDashboardResponse])
async def get_users_with_unfilled_timesheet(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[UserDashboardResponse]:
    return await DashboardService(db).get_users_with_unfilled_timesheet(year, month, department, region)
