# Resource Management System

[![Star this repo](https://img.shields.io/github/stars/amulyavarshney/Resource-Management-System?style=social)](https://github.com/amulyavarshney/Resource-Management-System/stargazers)
[![Fork this repo](https://img.shields.io/github/forks/amulyavarshney/Resource-Management-System?style=social)](https://github.com/amulyavarshney/Resource-Management-System/fork)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Open issues](https://img.shields.io/github/issues/amulyavarshney/Resource-Management-System)](https://github.com/amulyavarshney/Resource-Management-System/issues)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

A full-stack web application for tracking project progress and managing employee resources. It covers timesheet entry, leave and holiday management, interactive dashboards, and admin controls — all secured behind JWT-based authentication and role-based access.

If this project is useful to you, **star it** ⭐ — it helps others find it and lets you know when new features land. Found a rough edge? **Fork it**, fix it, and open a pull request; see [Contributing](#contributing) below.

## Repository Structure

```
Resource-Management-System/
├── backend/    # FastAPI (Python 3.11) Web API      → backend/README.md
└── frontend/   # Next.js 14 application              → frontend/README.md
```

Setup steps, environment variables, the full API reference, and the demo
accounts live in each project's own README, linked throughout this file —
this README stays focused on the big picture.

## Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI[Next.js static UI<br/>React + client JWT auth]
        Axios["Axios client<br/>Bearer JWT on every request"]
    end

    subgraph "FastAPI Server (backend)"
        Routers["API routers<br/>auth · user · project · weekData<br/>dashboard · holiday · leave · lock · mail"]
        Deps["Dependencies<br/>JWT decode · role checks · self-or-admin"]
        Services["Services<br/>business logic"]
    end

    DB[("PostgreSQL / SQL Server / MySQL")]

    UI -->|"sign in"| Axios
    UI -->|"page data"| Axios
    Axios -->|"POST /auth/login · Bearer JWT"| Routers
    Routers --> Deps
    Deps --> Services
    Services -->|"SQLAlchemy (async)"| DB
```

The static frontend talks only to the API. JWT tokens are stored in the browser
(localStorage when “Remember me” is checked, otherwise sessionStorage).

For the request/response and login-sequence diagrams, see
[backend/README.md](backend/README.md#authentication-flow); for the
role/permission model and data model, see
[backend/README.md](backend/README.md#data-model) and
[backend/README.md](backend/README.md#roles--permissions); for the
frontend's page map, see [frontend/README.md](frontend/README.md#pages).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2 (async), Alembic |
| Database | SQL Server / PostgreSQL / MySQL |
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Auth | JWT Bearer (backend) · client session storage (frontend) |
| Containerisation | Docker |

Full dependency lists: [backend/README.md](backend/README.md#technology) ·
[frontend/README.md](frontend/README.md#technology).

## Features

- **Timesheet management** — employees log hours per project per week; timesheets can be locked by period
- **Leave management** — apply for, view, and delete leave records with type and session (full/half day)
- **Holiday management** — company-wide and personal holiday overrides by region
- **Interactive dashboards** — project and user analytics with FTE / external breakdowns
- **Admin panel** — full CRUD for users, projects and holidays; bulk import from Excel; lock/unlock timesheets; consolidated reporting
- **User profiles** — update personal details, change or remove password
- **Role-based access** — Employee · Management · Executive · Admin · Developer

## Getting Started

1. **Backend** — follow [backend/README.md § Setup](backend/README.md#setup)
   to get the API running at `http://localhost:8000`.
2. **Frontend** — follow [frontend/README.md § Setup](frontend/README.md#setup)
   to get the UI running at `http://localhost:3000`.
3. **Try it out** — seed demo accounts and smoke-test the API with
   [backend/README.md § Demo accounts](backend/README.md#demo-accounts-localdev-only).

## Docker

Full stack (SQL Server + API + Next.js UI) from the repo root:

```sh
cp .env.example .env   # fill JWT_SECRET, DB_SA_PASSWORD
                       # DATABASE_URL must use database `rms` (not `master`)
docker compose up --build
# UI:  http://localhost:3000
# API: http://localhost:8000
```

Compose runs `db-init` to `CREATE DATABASE rms` after SQL Server is healthy,
then the API applies Alembic migrations on start.

API + database only: see [backend/README.md § Docker](backend/README.md#docker).
Frontend image alone: see [frontend/README.md § Docker](frontend/README.md#docker).

Production Docker runs `alembic upgrade head` before starting the API
(`backend/entrypoint.sh`). Keep `APP_ENV=production` so tables are not
auto-created via `create_all`.

## Production deploy

| Piece | Host |
|-------|------|
| Backend API | [Render](https://render.com) via [`render.yaml`](render.yaml) |
| Frontend | https://amulyavarshney.github.io (static export) |

### Backend (Render)

1. In Render: **New → Blueprint** and select this repository (uses `render.yaml`).
2. After the service is live, note the URL (e.g. `https://rms-api.onrender.com`).
3. Optionally set ESB mail env vars in the Render dashboard.
4. Ensure `ALLOWED_ORIGINS` includes `https://amulyavarshney.github.io`.

### Frontend (GitHub Pages)

1. Create (or use) the user site repo [`amulyavarshney/amulyavarshney.github.io`](https://github.com/amulyavarshney/amulyavarshney.github.io).
2. In this repo’s **Settings → Secrets and variables → Actions**, add:
   - `NEXT_PUBLIC_BACKEND_API` — e.g. `https://rms-api.onrender.com/api/v1`
   - `PAGES_DEPLOY_TOKEN` — a PAT with `contents:write` on `amulyavarshney.github.io`
3. Push to `main` (or run **Actions → Deploy GitHub Pages → Run workflow**).
4. Site: https://amulyavarshney.github.io

Auth is client-side JWT (browser storage). There is no Next.js server on Pages.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend ruff + pytest,
frontend lint + build, Playwright e2e against a SQLite-backed API, and an
Alembic + API smoke job against Postgres (`asyncpg`).

## Contributing

Contributions are very welcome, whether that's a bug fix, a new feature, or
just improving the docs.

1. [Fork the repository](https://github.com/amulyavarshney/Resource-Management-System/fork).
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make your changes — run the backend/frontend tests documented in their
   own READMEs as you go.
4. Commit your changes with a clear message.
5. Push and [open a pull request](https://github.com/amulyavarshney/Resource-Management-System/pulls) against `main`.

Not sure where to start? Check [open issues](https://github.com/amulyavarshney/Resource-Management-System/issues)
for ideas, or open a new one to discuss what you have in mind.

## License

MIT License. See [`LICENSE`](LICENSE) for details.
