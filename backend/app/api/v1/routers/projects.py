from fastapi import APIRouter, Query, UploadFile

from app.core.deps import AdminOrDeveloper, AllAuthenticated, DbSession
from app.models.enums import Department, Region
from app.schemas.common import MessageResponse
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/project", tags=["projects"], dependencies=[AllAuthenticated])


@router.get("", response_model=list[ProjectResponse])
async def get_projects(
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[ProjectResponse]:
    return await ProjectService(db).get_all(department, region)


@router.get("/{year}/{month}", response_model=list[ProjectResponse])
async def get_projects_for_period(
    year: int,
    month: int,
    db: DbSession,
    department: Department | None = Query(default=None),
    region: Region | None = Query(default=None),
) -> list[ProjectResponse]:
    return await ProjectService(db).get_all_for_period(year, month, department, region)


@router.get("/{id}", response_model=ProjectResponse)
async def get_project(id: int, db: DbSession) -> ProjectResponse:
    return await ProjectService(db).get_by_id(id)


@router.post("", response_model=ProjectResponse, status_code=201, dependencies=[AdminOrDeveloper])
async def create_project(body: ProjectCreate, db: DbSession) -> ProjectResponse:
    return await ProjectService(db).create(body)


@router.post("/import", response_model=MessageResponse, status_code=201, dependencies=[AdminOrDeveloper])
async def import_projects(excelFile: UploadFile, db: DbSession) -> MessageResponse:
    return await ProjectService(db).import_from_excel(excelFile)


@router.patch("/{id}", response_model=ProjectResponse, dependencies=[AdminOrDeveloper])
async def update_project(id: int, body: ProjectUpdate, db: DbSession) -> ProjectResponse:
    return await ProjectService(db).update(id, body)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def delete_project(
    id: int,
    db: DbSession,
    delete_now: bool | None = Query(default=None),
) -> MessageResponse:
    return await ProjectService(db).delete(id, delete_now)


@router.delete("/reset", response_model=MessageResponse, dependencies=[AdminOrDeveloper])
async def reset_projects(db: DbSession) -> MessageResponse:
    return await ProjectService(db).reset()
