from datetime import datetime

from pydantic import BaseModel

from app.schemas.project import ProjectResponse
from app.schemas.user import UserResponse


class DashboardResponse(BaseModel):
    total_projects: int
    total_int_users: int
    total_ext_users: int
    total_users: int
    total_int_work_hours: int
    total_ext_work_hours: int
    total_work_hours: int


class ProjectDashboardResponse(BaseModel):
    project_id: int
    project_number: str
    project_title: str
    business: str | None
    department: int
    region: int
    description: str | None
    total_int_users: int
    total_ext_users: int
    total_users: int
    total_int_work_hours: int
    total_ext_work_hours: int
    total_work_hours: int
    users: list[UserResponse] | None = None


class UserDashboardResponse(BaseModel):
    user_id: int
    emp_id: int | None
    user_name: str | None
    first_name: str
    last_name: str
    email: str
    is_external: bool
    department: int
    role: int
    work_hours_per_day: int
    parent_id: int
    region: int
    last_saved_time: datetime | None
    total_projects: int
    total_week1_hours: int
    total_week2_hours: int
    total_week3_hours: int
    total_week4_hours: int
    total_week5_hours: int | None
    projects: list[ProjectResponse] | None = None
