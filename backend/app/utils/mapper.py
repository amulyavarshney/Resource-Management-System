from datetime import date

from app.core.security import create_password_hash
from app.models.enums import Department, Region, Role
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectResponse
from app.schemas.user import UserCreate, UserResponse
from app.utils.enum_utils import parse_by_name_or_description


def user_to_entity(data: UserCreate) -> User:
    password_hash, password_salt = create_password_hash(data.password)
    return User(
        emp_id=data.emp_id,
        first_name=data.first_name.title(),
        last_name=data.last_name.title(),
        email=data.email,
        password_hash=password_hash,
        password_salt=password_salt,
        is_external="ext" in data.email,
        department=int(data.department),
        region=int(data.region),
        role=int(data.role),
        work_hours_per_day=data.work_hours_per_day,
        parent_id=data.parent_id,
        date_created=date.today(),
    )


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        emp_id=user.emp_id,
        user_name=user.user_name,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        is_external=user.is_external,
        is_password_protected=user.password_hash is not None,
        department=user.department,
        region=user.region,
        role=user.role,
        work_hours_per_day=user.work_hours_per_day,
        parent_id=user.parent_id,
        last_saved_time=user.last_saved_time,
    )


def _cell_str(row: dict, key: str) -> str | None:
    value = row.get(key)
    return None if value in (None, "") else str(value)


def _cell_enum(row: dict, key: str, enum_cls: type) -> int:
    value = row[key]
    return int(value) if isinstance(value, int) else int(parse_by_name_or_description(enum_cls, str(value)))


def user_row_to_entity(row: dict) -> User:
    """Build a User from a raw Excel row (bulk import) — no password column."""
    email = str(row["Email"]).strip()
    role = _cell_str(row, "Role")
    return User(
        emp_id=int(row["EmpId"]) if _cell_str(row, "EmpId") else None,
        user_name=_cell_str(row, "UserName"),
        first_name=str(row["FirstName"]).title(),
        last_name=str(row["LastName"]).title(),
        email=email,
        is_external="ext" in email,
        department=_cell_enum(row, "Department", Department),
        region=_cell_enum(row, "Region", Region),
        role=_cell_enum(row, "Role", Role) if role else int(Role.Employee),
        work_hours_per_day=int(row["WorkHoursPerDay"]),
        parent_id=int(row["ParentId"]) if _cell_str(row, "ParentId") else 0,
        date_created=date.today(),
    )


def project_row_to_entity(row: dict) -> Project:
    """Build a Project from a raw Excel row (bulk import)."""
    return Project(
        number=str(row["Number"]),
        title=str(row["Title"]),
        business=_cell_str(row, "Business"),
        department=_cell_enum(row, "Department", Department),
        region=_cell_enum(row, "Region", Region),
        description=_cell_str(row, "Description") or "",
        date_created=date.today(),
    )


def project_to_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        number=project.number,
        title=project.title,
        business=project.business,
        department=project.department,
        region=project.region,
        description=project.description,
    )
