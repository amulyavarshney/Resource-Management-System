# Resource Management System

A full-stack web application for tracking project progress and managing employee resources. It covers timesheet entry, leave and holiday management, interactive dashboards, and admin controls — all secured behind JWT-based authentication.

## Repository Structure

```
Resource-Management-System/
├── backend/    # FastAPI (Python 3.11) Web API
└── frontend/   # Next.js 14 application
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2 (async), Alembic |
| Database | SQL Server / PostgreSQL / MySQL |
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Auth | JWT Bearer (backend) · NextAuth.js 4 (frontend) |
| Containerisation | Docker |

## Features

- **Timesheet management** — employees log hours per project per week; timesheets can be locked by period
- **Leave management** — apply for, view, and delete leave records with type and session (full/half day)
- **Holiday management** — company-wide and personal holiday overrides by region
- **Interactive dashboards** — project and user analytics with FTE / external breakdowns
- **Admin panel** — full CRUD for users, projects and holidays; bulk import from Excel; lock/unlock timesheets; consolidated reporting
- **User profiles** — update personal details, change or remove password
- **Role-based access** — Employee · Management · Executive · Admin · Developer

## Quick Start

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Python | 3.11 |
| SQL Server, PostgreSQL, or MySQL | — |
| Node.js | 18 LTS |
| npm | 9 |

### Backend

```sh
cd backend

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
# API available at http://localhost:8000
# Swagger UI at http://localhost:8000/swagger
```

### Frontend

```sh
cd frontend

# Copy the dev env template and fill in values
cp .env.development .env.local
# Required variables:
#   NEXTAUTH_URL          = http://localhost:3000
#   NEXTAUTH_SECRET       = <random string>
#   NEXT_PUBLIC_BACKEND_API = http://localhost:8000/api/v1

npm install
npm run dev
# App available at http://localhost:3000
```

## Environment Variables

### Frontend (`.env.development` / `.env.production`)

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Canonical URL of the frontend app |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth.js JWTs |
| `NEXT_PUBLIC_FRONTEND_URL` | Public frontend base URL |
| `NEXT_PUBLIC_BACKEND_API` | Backend API base URL (`/api/v1`) |

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLAlchemy async connection string (SQL Server, PostgreSQL, or MySQL) |
| `JWT_SECRET` | Secret key used to sign JWT tokens (min 32 chars) |
| `JWT_ALGORITHM` | JWT signing algorithm (default `HS512`) |
| `JWT_EXPIRE_HOURS` | Token lifetime in hours (default `2`) |
| `ALLOWED_ORIGINS` | CORS-allowed frontend origins |
| `APP_ENV` | `development` enables Swagger UI |
| `LOG_LEVEL` | structlog level (default `info`) |

## Docker

```sh
# Build and run the backend container
cd backend
docker build -t rms-api .
docker run -p 8000:8000 rms-api

# Or bring up the backend with its database via Docker Compose
docker compose up --build
```

## API Reference

Full interactive docs are available at `/swagger` when running the backend in development mode.

| Router | Base path | Description |
|--------|-----------|-------------|
| Auth | `/api/v1/auth` | Login and registration |
| Users | `/api/v1/user` | User CRUD, password management |
| Projects | `/api/v1/project` | Project CRUD, bulk import |
| WeekData | `/api/v1/weekData` | Timesheet entries |
| Dashboard | `/api/v1/dashboard` | Analytics and metrics |
| Holiday | `/api/v1/holiday` | Company and personal holidays |
| Leave | `/api/v1/leave` | Leave records |
| Lock | `/api/v1/lock` | Lock / unlock timesheet periods |

See [`backend/README.md`](backend/README.md) for the full endpoint list and design notes.

## Project READMEs

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your changes with a clear message.
4. Push and open a pull request against `main`.

## License

MIT License. See [`LICENSE`](LICENSE) for details.
