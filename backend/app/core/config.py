from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS512"
    jwt_expire_hours: int = 2

    # Optional: server-to-server Google exchange (not used by the static Pages UI).
    internal_auth_secret: str = ""

    # Defaults applied when a first-time Google sign-in creates a user.
    # Bitmask values matching Department / Region IntFlags (1 = D1 / India).
    google_default_department: int = 1
    google_default_region: int = 1

    # Accept either a JSON array or a comma-separated string from the env file
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://amulyavarshney.github.io",
    ]

    app_env: str = "development"
    log_level: str = "info"
    # Disable in automated tests via RATE_LIMIT_ENABLED=false (see tests/conftest.py).
    rate_limit_enabled: bool = True
    # When false, POST /auth/register returns 403 (invite/admin-only deployments).
    allow_self_registration: bool = True
    # JWT lifetime when login is requested with remember=true (hours).
    jwt_remember_expire_hours: int = 24 * 14

    # SMTP mail (optional — POST /api/v1/mail returns 503 when host/from unset)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_from_name: str = "Resource Management System"
    smtp_reply_to: str = ""
    # STARTTLS on 587 (default). For implicit SSL (465) set SMTP_SSL=true and SMTP_STARTTLS=false.
    smtp_starttls: bool = True
    smtp_ssl: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, v: Any) -> Any:
        """Render/Heroku often provide postgres:// — SQLAlchemy needs asyncpg."""
        if not isinstance(v, str):
            return v
        if v.startswith("postgres://"):
            return "postgresql+asyncpg://" + v[len("postgres://") :]
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            return "postgresql+asyncpg://" + v[len("postgresql://") :]
        return v

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Support both JSON array and comma-separated
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
