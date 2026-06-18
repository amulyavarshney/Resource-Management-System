from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DuplicateEntityException, LoginFailedException
from app.core.security import create_access_token, create_password_hash, verify_password
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import LoginRequest, UserCreate
from app.utils.mapper import user_to_entity


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def register(self, data: UserCreate) -> MessageResponse:
        stmt = select(User).where(
            User.date_deleted.is_(None),
            (User.emp_id == data.emp_id) | (User.email == data.email),
        )
        existing = (await self._db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise DuplicateEntityException("User already exists. Registration aborted.")

        user = user_to_entity(data)
        self._db.add(user)
        await self._db.flush()
        return MessageResponse(message="User registered successfully.")

    async def login(self, data: LoginRequest) -> str:
        stmt = select(User).where(User.email == data.email)
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            raise LoginFailedException()

        if not verify_password(data.password, user.password_hash, user.password_salt):
            raise LoginFailedException()

        return create_access_token(user.email, user.role_name)


# helper property — attach to User at runtime to avoid circular import
def _role_name(self: User) -> str:
    from app.models.enums import Role
    return Role(self.role).name


User.role_name = property(_role_name)  # type: ignore[attr-defined]
