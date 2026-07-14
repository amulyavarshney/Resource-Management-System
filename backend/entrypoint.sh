#!/bin/sh
set -e
# Apply pending migrations before serving traffic (production / Docker).
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "${UVICORN_WORKERS:-4}"
