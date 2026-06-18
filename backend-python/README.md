# Backend — Python / FastAPI

Python 3.11 + FastAPI rewrite of the Resource Management System API. Feature-complete migration from the original C# / ASP.NET Core 6 backend — identical routes, business logic, and database schema.

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
backend-python/
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

## Key Design Decisions

| C# | Python |
|----|--------|
| `HMACSHA512` password hash | `hmac.new(salt, password, sha512)` — byte-for-byte identical |
| `[Flags]` enum bitwise filter | `IntFlag` + raw bitwise AND in SQLAlchemy `.op("&")` |
| `DateDeleted` soft delete | Same column, same query pattern |
| `SaveChanges` in EF Core | `await session.flush()` + auto-commit in `get_db` |
| `GeneralExceptionHandler` filter | `@app.exception_handler(ExcType)` per exception class |
| Distributed cache for lock | Stub — replace `DashboardService.get/set_lock` with Redis |
| Excel import (ExcelDataReader) | `openpyxl` — reads `.xlsx` files with same column names |
