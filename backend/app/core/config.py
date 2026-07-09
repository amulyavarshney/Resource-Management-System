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

    # Shared secret with the Next.js server, used to authenticate the
    # server-to-server POST /auth/google exchange (see AuthService.google_login).
    internal_auth_secret: str = ""

    # Accept either a JSON array or a comma-separated string from the env file
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    app_env: str = "development"
    log_level: str = "info"

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
