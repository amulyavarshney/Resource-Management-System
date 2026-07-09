from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import router as api_v1_router
from app.core.config import get_settings
from app.core.exceptions import (
    DomainInvariantException,
    DuplicateEntityException,
    LoginFailedException,
    OperationNotSupportedException,
    PasswordMismatchException,
    RecordNotFoundException,
)
from app.core.logging import configure_logging, get_logger

_settings = get_settings()
_log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(_settings.log_level)
    _log.info("startup", env=_settings.app_env)
    # In development, auto-create tables so SQLite works out-of-the-box
    # without running Alembic. Production should use `alembic upgrade head`.
    if _settings.is_development:
        from app.db.base import Base
        from app.db.session import engine
        import app.models  # register all ORM models
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    _log.info("shutdown")


app = FastAPI(
    title="Resource Management System API",
    version="1.0.0",
    docs_url="/swagger" if _settings.is_development else None,
    redoc_url="/redoc" if _settings.is_development else None,
    openapi_url="/openapi.json" if _settings.is_development else None,
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def correlation_id_header(request: Request, call_next):
    import uuid
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'none'"
    return response


# ── Exception handlers ──────────────────────────────────────────────────────

def _problem(status_code: int, title: str, detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"title": title, "detail": detail, "status": status_code},
    )


@app.exception_handler(RecordNotFoundException)
async def handle_not_found(request: Request, exc: RecordNotFoundException) -> JSONResponse:
    return _problem(status.HTTP_404_NOT_FOUND, "Resource not found", str(exc))


@app.exception_handler(DuplicateEntityException)
async def handle_duplicate(request: Request, exc: DuplicateEntityException) -> JSONResponse:
    return _problem(status.HTTP_409_CONFLICT, "Conflict", str(exc))


@app.exception_handler(LoginFailedException)
async def handle_login_failed(request: Request, exc: LoginFailedException) -> JSONResponse:
    return _problem(status.HTTP_401_UNAUTHORIZED, "Unauthorized", str(exc))


@app.exception_handler(PasswordMismatchException)
async def handle_password_mismatch(request: Request, exc: PasswordMismatchException) -> JSONResponse:
    return _problem(status.HTTP_400_BAD_REQUEST, "Password mismatch", str(exc))


@app.exception_handler(OperationNotSupportedException)
async def handle_operation_not_supported(request: Request, exc: OperationNotSupportedException) -> JSONResponse:
    return _problem(status.HTTP_405_METHOD_NOT_ALLOWED, "Operation not supported", str(exc))


@app.exception_handler(DomainInvariantException)
async def handle_domain_invariant(request: Request, exc: DomainInvariantException) -> JSONResponse:
    return _problem(status.HTTP_400_BAD_REQUEST, "Invalid request", str(exc))


@app.exception_handler(ValueError)
async def handle_value_error(request: Request, exc: ValueError) -> JSONResponse:
    return _problem(status.HTTP_422_UNPROCESSABLE_ENTITY, "Validation error", str(exc))


@app.exception_handler(Exception)
async def handle_unhandled(request: Request, exc: Exception) -> JSONResponse:
    _log.error("unhandled_exception", error=str(exc), path=request.url.path)
    return _problem(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error", "An unexpected error occurred.")


# ── Routes ──────────────────────────────────────────────────────────────────

app.include_router(api_v1_router)


@app.get("/health/live", tags=["health"])
async def health_live() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
async def health_ready() -> dict[str, Any]:
    from sqlalchemy import text
    from app.db.session import AsyncSessionLocal

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        _log.error("health_check_db_failure", error=str(e))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "db": "unavailable"},
        )
