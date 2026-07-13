"""Export the FastAPI OpenAPI schema for frontend type generation.

Usage (from backend/):
    python -m scripts.export_openapi > ../frontend/openapi.json

Does not require a running server or real database — only enough env for
Settings to load so `app.main` can import.
"""

from __future__ import annotations

import json
import os
import sys

# Minimal env so Settings/app can import without a local .env
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "export-openapi-secret-key-min-32-chars")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")
os.environ.setdefault("APP_ENV", "development")


def main() -> None:
    from app.main import app

    schema = app.openapi()
    json.dump(schema, sys.stdout, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
