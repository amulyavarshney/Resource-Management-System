from datetime import date, datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateEntityException,
    OperationNotSupportedException,
    PasswordMismatchException,
    RecordNotFoundException,
)
from app.core.security import create_password_hash, verify_password
from app.models.enums import Department, Region, Role
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import PasswordChange, UserCreate, UserResponse, UserUpdate
from app.utils.mapper import user_to_entity, user_to_response


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------ queries

    async def get_all(self, department: Department | None, region: Region | None) -> list[UserResponse]:
        stmt = (
            select(User)
            .where(
                (User.department.op("&")(int(department))) > 0 if department is not None else True,
                (User.region.op("&")(int(region))) > 0 if region is not None else True,
                (User.date_deleted.is_(None)) | (User.date_deleted >= datetime.now(timezone.utc)),
            )
        )
        users = (await self._db.execute(stmt)).scalars().all()
        return [user_to_response(u) for u in users]

    async def get_managers(self, department: Department | None, region: Region | None) -> list[UserResponse]:
        stmt = (
            select(User)
            .where(
                (User.department.op("&")(int(department))) > 0 if department is not None else True,
                (User.region.op("&")(int(region))) > 0 if region is not None else True,
                (User.date_deleted.is_(None)) | (User.date_deleted >= datetime.now(timezone.utc)),
                User.role.notin_([Role.Employee, Role.Developer]),
            )
        )
        users = (await self._db.execute(stmt)).scalars().all()
        return [user_to_response(u) for u in users]

    async def get_all_for_period(
        self,
        year: int,
        month: int,
        department: Department | None,
        region: Region | None,
        parent_id: int | None = None,
    ) -> list[UserResponse]:
        from app.utils.date_utils import first_day_of_next_month

        next_month = first_day_of_next_month(year, month)
        stmt = select(User).where(
            (User.department.op("&")(int(department))) > 0 if department is not None else True,
            (User.region.op("&")(int(region))) > 0 if region is not None else True,
            (User.date_deleted.is_(None)) | (User.date_deleted >= next_month),
            User.date_created < next_month,
        )
        if parent_id is not None:
            stmt = stmt.where(User.parent_id == parent_id)
        users = (await self._db.execute(stmt)).scalars().all()
        return [user_to_response(u) for u in users]

    async def get_by_id(self, user_id: int) -> UserResponse:
        user = await self._from_id(user_id)
        return user_to_response(user)

    async def get_by_email(self, email: str) -> UserResponse:
        stmt = select(User).where(User.email == email)
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            raise RecordNotFoundException(f"Could not find any User with email: {email}")
        return user_to_response(user)

    # ------------------------------------------------------------------ writes

    async def create(self, data: UserCreate) -> UserResponse:
        stmt = select(User).where(
            User.date_deleted.is_(None),
            (User.emp_id == data.emp_id) | (User.email == data.email),
        )
        existing = (await self._db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise DuplicateEntityException("User already exists")

        if data.parent_id != 0:
            parent_stmt = select(User).where(User.id == data.parent_id)
            parent = (await self._db.execute(parent_stmt)).scalar_one_or_none()
            if parent is None:
                raise OperationNotSupportedException("Parent does not exist")

        user = user_to_entity(data)
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user_to_response(user)

    async def update(self, user_id: int, data: UserUpdate) -> UserResponse:
        user = await self._from_id(user_id)
        if user.date_deleted is not None:
            raise OperationNotSupportedException(
                f"User with id {user_id} is scheduled to delete on {user.date_deleted}."
            )
        if data.emp_id is not None:
            user.emp_id = data.emp_id
        if data.user_name is not None:
            user.user_name = data.user_name
        if data.first_name is not None:
            user.first_name = data.first_name.title()
        if data.last_name is not None:
            user.last_name = data.last_name.title()
        if data.email is not None:
            user.email = data.email
            user.is_external = "ext" in data.email
        if data.department is not None:
            user.department = int(data.department)
        if data.region is not None:
            user.region = int(data.region)
        if data.role is not None:
            user.role = int(data.role)
        if data.work_hours_per_day is not None:
            user.work_hours_per_day = data.work_hours_per_day
        if data.parent_id is not None:
            user.parent_id = data.parent_id
        if data.last_saved_time is not None:
            user.last_saved_time = data.last_saved_time
        user.date_modified = date.today()
        await self._db.flush()
        await self._db.refresh(user)
        return user_to_response(user)

    async def update_last_saved_time(self, user_id: int, last_saved_time: datetime) -> UserResponse:
        user = await self._from_id(user_id)
        user.last_saved_time = last_saved_time
        await self._db.flush()
        await self._db.refresh(user)
        return user_to_response(user)

    async def change_password(self, user_id: int, data: PasswordChange) -> MessageResponse:
        user = await self._from_id(user_id)
        if data.old_password is not None and not verify_password(
            data.old_password, user.password_hash, user.password_salt
        ):
            raise PasswordMismatchException()
        if data.old_password == data.new_password:
            raise ValueError("Old and New Password are the same.")
        password_hash, password_salt = create_password_hash(data.new_password)
        user.password_hash = password_hash
        user.password_salt = password_salt
        await self._db.flush()
        return MessageResponse(message="Password changed successfully.")

    async def remove_password(self, user_id: int, current_password: str) -> MessageResponse:
        user = await self._from_id(user_id)
        if not verify_password(current_password, user.password_hash, user.password_salt):
            raise PasswordMismatchException()
        user.password_hash = None
        user.password_salt = None
        await self._db.flush()
        return MessageResponse(message="Password removed successfully.")

    async def delete(self, user_id: int, delete_now: bool | None) -> MessageResponse:
        from app.utils.date_utils import first_day_of_next_month

        user = await self._from_id(user_id)
        if delete_now is not True:
            if user.date_deleted is not None:
                raise OperationNotSupportedException(
                    f"User with id {user_id} is already scheduled to delete on {user.date_deleted}."
                )
            today = date.today()
            user.date_deleted = first_day_of_next_month(today.year, today.month)
        elif user.date_deleted is not None:
            user.date_deleted = None
        await self._db.delete(user)
        await self._db.flush()
        return MessageResponse(message=f"User with id {user_id} is deleted successfully.")

    async def reset(self) -> MessageResponse:
        await self._db.execute(delete(User))
        await self._db.flush()
        return MessageResponse(message="Users table reset successfully.")

    # ------------------------------------------------------------------ helpers

    async def _from_id(self, user_id: int) -> User:
        stmt = select(User).where(
            (User.date_deleted.is_(None)) | (User.date_deleted >= datetime.now(timezone.utc)),
            User.id == user_id,
        )
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            raise RecordNotFoundException(f"Could not find any User with id: {user_id}")
        return user
