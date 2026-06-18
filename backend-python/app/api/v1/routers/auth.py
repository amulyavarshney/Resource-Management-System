from fastapi import APIRouter

from app.core.deps import DbSession
from app.schemas.common import MessageResponse
from app.schemas.user import LoginRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=str)
async def login(body: LoginRequest, db: DbSession) -> str:
    return await AuthService(db).login(body)


@router.post("/register", response_model=MessageResponse)
async def register(body: UserCreate, db: DbSession) -> MessageResponse:
    return await AuthService(db).register(body)
