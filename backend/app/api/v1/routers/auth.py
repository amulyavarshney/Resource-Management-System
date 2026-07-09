import hmac

from fastapi import APIRouter, Header, HTTPException, status

from app.core.config import get_settings
from app.core.deps import DbSession
from app.schemas.common import MessageResponse
from app.schemas.user import GoogleLoginRequest, LoginRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=str)
async def login(body: LoginRequest, db: DbSession) -> str:
    return await AuthService(db).login(body)


@router.post("/register", response_model=MessageResponse)
async def register(body: UserCreate, db: DbSession) -> MessageResponse:
    return await AuthService(db).register(body)


@router.post("/google", response_model=str)
async def google_login(
    body: GoogleLoginRequest,
    db: DbSession,
    x_internal_secret: str = Header(default=""),
) -> str:
    settings = get_settings()
    # Reject before touching the database if the shared secret is missing,
    # empty, or wrong — this route must only ever be called by our own
    # Next.js server, never directly by a browser.
    if not settings.internal_auth_secret or not hmac.compare_digest(
        x_internal_secret, settings.internal_auth_secret
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing internal secret")
    return await AuthService(db).google_login(body)
