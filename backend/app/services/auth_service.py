from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import DuplicateEntityException, LoginFailedException
from app.core.security import create_access_token, verify_password
from app.models.enums import Role
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import GoogleLoginRequest, LoginRequest, UserCreate
from app.utils.mapper import user_to_entity


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def register(self, data: UserCreate) -> MessageResponse:
        conditions = [User.email == data.email]
        if data.emp_id is not None:
            conditions.append(User.emp_id == data.emp_id)
        stmt = select(User).where(User.date_deleted.is_(None), or_(*conditions))
        existing = (await self._db.execute(stmt)).scalars().first()
        if existing:
            raise DuplicateEntityException("User already exists. Registration aborted.")

        user = user_to_entity(data)
        # Self-registration must never grant a privileged role — always Employee,
        # regardless of what the client sent. Elevating a role requires an
        # authenticated admin via PATCH /user/{id}.
        user.role = int(Role.Employee)
        self._db.add(user)
        await self._db.flush()
        return MessageResponse(message="User registered successfully.")

    async def login(self, data: LoginRequest) -> str:
        today = date.today()
        stmt = select(User).where(
            User.email == data.email,
            (User.date_deleted.is_(None)) | (User.date_deleted > today),
        )
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            raise LoginFailedException()

        if not verify_password(data.password, user.password_hash, user.password_salt):
            raise LoginFailedException()

        settings = get_settings()
        expire_hours = (
            settings.jwt_remember_expire_hours if data.remember else settings.jwt_expire_hours
        )
        return create_access_token(
            user.id, user.email, user.role_name, expire_hours=expire_hours
        )

    async def google_login(self, data: GoogleLoginRequest) -> str:
        """Issue an app JWT for a Google-verified identity.

        Callable only via the internal-secret-gated /auth/google route — by
        the time this runs, the caller (the Next.js server) has already had
        NextAuth's Google provider verify the email. An email match against
        an existing user (regardless of that user's auth_provider) is treated
        as sufficient proof of same identity; a new row is created otherwise,
        always as Role.Employee with auth_provider="google" and no password.
        """
        stmt = select(User).where(User.email == data.email, User.date_deleted.is_(None))
        user = (await self._db.execute(stmt)).scalar_one_or_none()
        if user is None:
            settings = get_settings()
            user = User(
                first_name=data.first_name.title(),
                last_name=data.last_name.title(),
                email=data.email,
                password_hash=None,
                password_salt=None,
                is_external="ext" in data.email,
                auth_provider="google",
                department=settings.google_default_department,
                region=settings.google_default_region,
                role=int(Role.Employee),
                work_hours_per_day=8,
                parent_id=0,
                date_created=date.today(),
            )
            self._db.add(user)
            await self._db.flush()
            await self._db.refresh(user)

        return create_access_token(user.id, user.email, user.role_name)


# helper property — attach to User at runtime to avoid circular import
def _role_name(self: User) -> str:
    from app.models.enums import Role
    return Role(self.role).name


User.role_name = property(_role_name)  # type: ignore[attr-defined]
