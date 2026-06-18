from datetime import date

from app.core.security import create_password_hash
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectResponse
from app.schemas.user import UserCreate, UserResponse


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
