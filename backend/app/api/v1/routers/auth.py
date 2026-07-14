import hmac

from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.config import get_settings
from app.core.deps import DbSession
from app.core.rate_limit import limiter
from app.schemas.common import MessageResponse
from app.schemas.user import GoogleLoginRequest, LoginRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=str)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: DbSession) -> str:
    return await AuthService(db).login(body)


@router.post("/register", response_model=MessageResponse)
@limiter.limit("5/minute")
async def register(request: Request, body: UserCreate, db: DbSession) -> MessageResponse:
    settings = get_settings()
    if not settings.allow_self_registration:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Self-registration is disabled",
        )
    return await AuthService(db).register(body)


@router.post("/google", response_model=str)
@limiter.limit("30/minute")
async def google_login(
    request: Request,
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal secret",
        )
    return await AuthService(db).google_login(body)
