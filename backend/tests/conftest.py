import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Settings are read at import time, so required env vars must be set before
# importing anything under app.* — tests should not depend on a local .env.
os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)
os.environ.setdefault("JWT_SECRET", "test-secret-key-at-least-32-characters-long")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")
os.environ.setdefault("INTERNAL_AUTH_SECRET", "test-internal-auth-secret")
os.environ.setdefault("GOOGLE_DEFAULT_DEPARTMENT", "1")
os.environ.setdefault("GOOGLE_DEFAULT_REGION", "1")

from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402

_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
_session_factory = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)


@pytest.fixture(scope="session", autouse=True)
async def create_tables():
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with _session_factory() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


async def promote_to_role(db_session: AsyncSession, user_id: int, role: int) -> None:
    """Test-only helper: directly set a user's role, bypassing the API.

    Self-registration always creates Employee accounts (by design — see
    AuthService.register), so tests that need an Admin/Developer caller must
    bootstrap one this way rather than via the API, which has no unauthenticated
    or self-service path to a privileged role.
    """
    from sqlalchemy import select

    from app.models.user import User

    user = (await db_session.execute(select(User).where(User.id == user_id))).scalar_one()
    user.role = role
    await db_session.flush()
