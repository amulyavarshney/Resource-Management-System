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
| Auth | python-jose (JWT) + HMAC-SHA512 passwords | ≥ 3.3 |
| Excel | openpyxl | ≥ 3.1 |
| Logging | structlog | ≥ 24.1 |
| Tests | pytest-asyncio + httpx | ≥ 0.23 / 0.27 |

## Project Structure

```
backend/
├── app/
│   ├── api/v1/routers/     # FastAPI routers (one per resource)
│   ├── core/               # Config, security (JWT + HMAC passwords), deps, exceptions, logging
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

## Data Model

```mermaid
erDiagram
    User ||--o{ WeekData : logs
    User ||--o{ Leave : takes
    User ||--o{ PersonalHoliday : has
    User ||--o{ UserFavourite : favourites
    User }o--o{ User : "reports to (parent_id)"
    Project ||--o{ WeekData : "logged against"
    Project ||--o{ UserFavourite : "favourited as"

    User {
        int id PK
        string email
        string first_name
        string last_name
        string auth_provider "local or google"
        int role "Employee..Developer"
        int department "IntFlag: D1, D2"
        int region "IntFlag: India, USA"
        int parent_id FK "reporting manager"
        datetime date_deleted "soft delete"
    }
    Project {
        int id PK
        string number
        string title
        int department
        int region
        datetime date_deleted "soft delete"
    }
    WeekData {
        int year PK
        int month PK
        int user_id PK, FK
        int project_id PK, FK
        int week1
        int week2
        int week3
        int week4
        int week5
    }
    Leave {
        date date PK
        int user_id PK, FK
        int type "Casual/Planned/Sick/Unplanned"
        int session "FullDay/HalfDay"
    }
    Holiday {
        date date PK
        int region PK
        string name
        int type "Compulsory/Festival"
    }
    PersonalHoliday {
        date date PK
        int user_id PK, FK
        string name
        int type
        bool show
    }
    TimesheetLock {
        int department PK "0 = unspecified"
        int region PK "0 = unspecified"
        bool is_locked
    }
    UserFavourite {
        int user_id PK, FK
        int project_id PK
    }
```

Composite primary keys (e.g. `WeekData` on `year + month + user_id +
project_id`) avoid a separate surrogate key for what's naturally a join
row. Nothing is ever hard-deleted — every entity with a `date_deleted`
column is filtered out of normal queries rather than removed, so historical
timesheets/projects/users stay intact even after "deletion."

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

API + SQL Server only (from `backend/`):

```sh
cp .env.example .env   # fill in JWT_SECRET at minimum; set DATABASE_URL host to `db`
docker compose up --build
# API:     http://localhost:8000
# Swagger: http://localhost:8000/swagger (development mode only)
```

The container entrypoint runs `alembic upgrade head` before starting uvicorn.

For the full stack including the Next.js UI, use the root `docker-compose.yml`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | SQLAlchemy async URL (see `.env.example`) |
| `JWT_SECRET` | Yes | — | HS512 signing key, min 32 chars |
| `JWT_ALGORITHM` | No | `HS512` | JWT signing algorithm |
| `JWT_EXPIRE_HOURS` | No | `2` | Token lifetime in hours |
| `INTERNAL_AUTH_SECRET` | Only if using Google | — | Shared secret for server-to-server Google exchange |
| `GOOGLE_DEFAULT_DEPARTMENT` | No | `1` (D1) | Department bitmask for first-time Google sign-ups |
| `GOOGLE_DEFAULT_REGION` | No | `1` (India) | Region bitmask for first-time Google sign-ups |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated CORS origins |
| `APP_ENV` | No | `development` | `development` enables Swagger UI |
| `LOG_LEVEL` | No | `info` | structlog level |
| `RATE_LIMIT_ENABLED` | No | `true` | Rate-limit `/auth/login` (10/min), `/auth/register` (5/min), `/auth/google` (30/min) |

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

## Roles & Permissions

Every role higher up the list also satisfies every check lower down —
`AdminOrDeveloper` is a strict superset of `ManagementAndAbove`, which is a
strict superset of `AllAuthenticated`. `SelfOrAdmin`/`SelfOnly` are
orthogonal to the role tiers: they compare the JWT's `id` claim against the
`{id}` path parameter regardless of role.

```mermaid
flowchart TB
    subgraph "AllAuthenticated (any logged-in user)"
        Employee
        subgraph "ManagementAndAbove"
            Management
            Executive
            subgraph "AdminOrDeveloper"
                Admin
                Developer
            end
        end
    end
```

| Dependency (`app/core/deps.py`) | Allowed roles | Used on |
|---|---|---|
| `AllAuthenticated` | Employee, Management, Executive, Admin, Developer | Own timesheet/leave/holiday reads, profile (`/user/me`, self `GET/PATCH /user/{id}`), preferences, managers list |
| `ManagementAndAbove` | Management, Executive, Admin, Developer | `/dashboard/*`, bulk weekData/leave list reads, user directory lists, `POST /lock` |
| `AdminOrDeveloper` | Admin, Developer | `POST /user`, `*/import`, `*/reset`, `DELETE /user/{id}`, `DELETE /project/{id}`, company holiday writes |
| `SelfOrAdmin` / `SelfOrAdminUserId` | Caller's own id, or Admin/Developer | WeekData/leave/personal-holiday by `user_id`, `PATCH /user/{id}` |
| `SelfOnly` | Caller's own `id` only — no admin override | `PATCH /user/{id}/removePassword` |

`SelfOnly` has no admin override by design: nulling someone *else's*
password with no recovery path would be an unrecoverable lockout, so
removal is strictly self-service. `role` is never accepted from the
request body at account-creation time (self-registration, Google
sign-in) — it's always forced to `Employee` server-side; only an
already-authenticated Admin/Developer can set a different role via
`PATCH /user/{id}`.

Timesheet/leave **writes** are also rejected when the global timesheet lock
is on (Admin/Developer may bypass).

## API Reference

All routes are prefixed `/api/v1/`. Protected routes require `Authorization: Bearer <token>`.
Some routes additionally require Admin/Developer (or Management+) — see above.

| Router | Prefix | Auth |
|--------|--------|------|
| Auth | `/auth` | Public (`/register` can be disabled via `ALLOW_SELF_REGISTRATION`) |
| Users | `/user` | Required (`GET ""` / period lists: Management+; `GET /{id}`: self-or-admin; managers + `/me`: any authenticated) |
| Projects | `/project` | Required (create/update/import/delete/reset: Admin/Developer) |
| WeekData | `/weekData` | Required (self-or-admin for keyed routes; bulk list: Management+; reset: Admin/Developer) |
| Dashboard | `/dashboard` | Management+ |
| Holidays | `/holiday` | Required (personal by `user_id`: self-or-admin; company write/import/reset: Admin/Developer) |
| Leaves | `/leave` | Required (self-or-admin for user-scoped routes; bulk list: Management+; reset: Admin/Developer) |
| Lock | `/lock` | Required (set lock: Management+) |
| Preferences | `/preferences` | Required (favourites for the current user) |
| Health | `/health/live`, `/health/ready` | Public |
| Metrics | `/metrics` | Public (Prometheus scrape) |

Full interactive docs at `/swagger` in development mode.

### Observability

- Structured JSON logs via **structlog** (`LOG_LEVEL` controls verbosity).
- Every response includes `X-Correlation-ID` (echoed from the request or generated).
- Non-health requests emit an `http_request` log with method, path, status, and `duration_ms`.
- Probe endpoints: `GET /health/live` (process up) and `GET /health/ready` (DB reachable).

### Authentication flow

Both login paths converge on the same JWT shape (`id`, `email`, `Role`,
`exp`), so every downstream router treats a Credentials-issued and a
Google-issued token identically.

```mermaid
sequenceDiagram
    participant U as Browser
    participant N as Next.js server
    participant A as FastAPI /auth
    participant DB as Database

    rect rgb(240, 240, 240)
    note over U,DB: Credentials login
    U->>N: submit email + password
    N->>A: POST /auth/login
    A->>DB: look up User by email
    A->>A: verify HMAC-SHA512(password, salt) == stored hash
    A->>N: JWT {id, email, Role, exp}
    N->>U: session cookie (backendToken = JWT)
    end

    rect rgb(230, 245, 255)
    note over U,DB: Google sign-in
    U->>N: click "Sign in with Google"
    N->>Google: OAuth consent (NextAuth Google provider)
    Google->>N: verified identity (email, name)
    N->>A: POST /auth/google<br/>+ X-Internal-Secret header
    A->>A: compare_digest(secret, INTERNAL_AUTH_SECRET)
    alt secret invalid
        A->>N: 401 Unauthorized
    else secret valid
        A->>DB: look up User by email
        alt no match
            A->>DB: create User (role=Employee, auth_provider=google, no password)
        end
        A->>N: JWT {id, email, Role, exp}
        N->>U: session cookie (backendToken = JWT)
    end
    end

    note over U,A: Every later request
    U->>N: page load / API call
    N->>A: Authorization: Bearer JWT
    A->>A: decode JWT, run role/self-or-admin checks
```

`INTERNAL_AUTH_SECRET` never reaches the browser — only the Next.js server
and FastAPI hold it, so the `/auth/google` exchange can't be called by
anything except the trusted frontend server. Role is always assigned
server-side (`Role.Employee` for new registrations and new Google
sign-ins); no request body can set an arbitrary role at account-creation
time.

## Demo accounts (local/dev only)

Self-registration always creates an `Employee`-role account — there is no
way to self-serve into a privileged role. To try out Management/Executive/
Admin/Developer features locally, seed a fixed set of demo accounts:

```sh
cd backend && python -m scripts.seed_demo
```

This creates one account per role (idempotent — safe to re-run) and prints
the shared demo password. The script refuses to run unless
`APP_ENV=development`, so it can never be run against a production database.

| Email | Role |
|-------|------|
| `demo.employee@rms.example` | Employee |
| `demo.manager@rms.example` | Management |
| `demo.executive@rms.example` | Executive |
| `demo.admin@rms.example` | Admin |
| `demo.developer@rms.example` | Developer |

Password for all of the above: `DemoPass1!`

## Design Notes

- **Password hashing** — `hmac.new(salt, password, sha512)` with a random salt per user.
- **Department/Region filters** — modeled as `IntFlag` enums, filtered via bitwise AND in SQLAlchemy (`.op("&")`).
- **Soft deletes** — a `date_deleted` column on each entity; queries filter it out rather than physically deleting rows.
- **Timesheet lock** — DB-backed (`TimesheetLock` table), keyed by department/region (0 = unspecified). Survives restarts and works across multiple API workers.
- **Excel import** — `openpyxl` reads `.xlsx` uploads for bulk user/project/holiday import.
