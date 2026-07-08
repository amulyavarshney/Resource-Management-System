from pydantic import BaseModel

from app.models.enums import Department, Region


class ProjectCreate(BaseModel):
    number: str
    title: str
    business: str | None = None
    department: Department
    region: Region
    description: str | None = ""


class ProjectUpdate(BaseModel):
    number: str | None = None
    title: str | None = None
    business: str | None = None
    department: Department | None = None
    region: Region | None = None
    description: str | None = None


class ProjectResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    number: str
    title: str
    business: str | None
    department: int
    region: int
    description: str | None
    working_hours: int | None = None
