# Backend — Python / FastAPI

The Resource Management System API — a Python 3.11 + FastAPI service covering auth, users, projects, timesheets, dashboards, holidays, leaves, and timesheet locking.

## Technology

| Component | Package | Version |
|-----------|---------|---------|
| Framework | FastAPI | ≥ 0.115 |
| ASGI server | Uvicorn | ≥ 0.30 |
| ORM | SQLAlchemy (async) | ≥ 2.0 |
| Migrations | Alembic | ≥ 1.13 |
| Validation | Pydantic v2 | ≥ 2.7 |
| Auth | python-jose + passlib | ≥ 3.3 / 1.7 |
| Excel | openpyxl | ≥ 3.1 |
| Logging | structlog | ≥ 24.1 |
| Tests | pytest-asyncio + httpx | ≥ 0.23 / 0.27 |

## Project Structure

```
backend/
├── app/
│   ├── api/v1/routers/     # FastAPI routers (one per resource)
│   ├── core/               # Config, security (JWT + bcrypt), deps, exceptions, logging
│   ├── db/                 # SQLAlchemy engine, session, Base
│   ├── models/             # SQLAlchemy ORM models + enums
│   ├── schemas/            # Pydantic request/response models
│   ├── services/           # Business logic (one class per domain)
│   ├── utils/              # Date helpers, enum utils, Excel reader, mapper
│   └── main.py             # FastAPI app, middleware, exception handlers
├── alembic/                # Database migrations
├── tests/                  # pytest suite
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── .env.example
```

## Setup

### Prerequisites

- Python 3.11+
- SQL Server (or PostgreSQL/MySQL — see `DATABASE_URL` in `.env.example`)
- ODBC Driver 18 for SQL Server (if using SQL Server)

### Local development

```sh
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -e ".[dev]"

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS

# 4. Apply database migrations
alembic upgrade head

# 5. Start the server
uvicorn app.main:app --reload
# API:     http://localhost:8000
# Swagger: http://localhost:8000/swagger
```

### Docker

```sh
cp .env.example .env   # fill in JWT_SECRET at minimum
docker compose up --build
# API:     http://localhost:8000
# Swagger: http://localhost:8000/swagger (development mode only)
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | SQLAlchemy async URL (see `.env.example`) |
| `JWT_SECRET` | Yes | — | HS512 signing key, min 32 chars |
| `JWT_ALGORITHM` | No | `HS512` | JWT signing algorithm |
| `JWT_EXPIRE_HOURS` | No | `2` | Token lifetime in hours |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated CORS origins |
| `APP_ENV` | No | `development` | `development` enables Swagger UI |
| `LOG_LEVEL` | No | `info` | structlog level |

## Database Migrations

```sh
# Generate a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply all pending migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Running Tests

```sh
pip install -e ".[dev]"
# Tests use an in-memory SQLite database — no server needed
pytest -v
```

## API Reference

All routes are prefixed `/api/v1/`. Protected routes require `Authorization: Bearer <token>`.

| Router | Prefix | Auth |
|--------|--------|------|
| Auth | `/auth` | Public |
| Users | `/user` | Required |
| Projects | `/project` | Required |
| WeekData | `/weekdata` | Required |
| Dashboard | `/dashboard` | Required |
| Holidays | `/holiday` | Required |
| Leaves | `/leave` | Required |
| Lock | `/lock` | Required |
| Health | `/health/live`, `/health/ready` | Public |

Full interactive docs at `/swagger` in development mode.

## Design Notes

- **Password hashing** — `hmac.new(salt, password, sha512)` with a random salt per user.
- **Department/Region filters** — modeled as `IntFlag` enums, filtered via bitwise AND in SQLAlchemy (`.op("&")`).
- **Soft deletes** — a `date_deleted` column on each entity; queries filter it out rather than physically deleting rows.
- **Timesheet lock** — process-local in-memory store (`DashboardService`), keyed by department/region. Resets on restart; swap for Redis if you need it to survive restarts or run across multiple instances.
- **Excel import** — `openpyxl` reads `.xlsx` uploads for bulk user/project/holiday import.
