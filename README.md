# Resource Management System

A full-stack web application for tracking project progress and managing employee resources. It covers timesheet entry, leave and holiday management, interactive dashboards, and admin controls — all secured behind JWT-based authentication.

## Repository Structure

```
Resource-Management-System/
├── backend/ProjectProgressManagementSystem/   # ASP.NET Core 6 Web API
└── frontend/                                  # Next.js 14 application
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 6, ASP.NET Core Web API, Entity Framework Core 7 |
| Database | SQL Server (Code-First migrations) |
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
| .NET SDK | 6.0 |
| SQL Server | 2019 (local) or Azure SQL |
| Node.js | 18 LTS |
| npm | 9 |

### Backend

```sh
cd backend/ProjectProgressManagementSystem

# 1. Set your connection string in appsettings.json → ConnectionStrings:Development
# 2. Set a strong JwtSecret in appsettings.json → AppSettings:JwtSecret

dotnet restore
dotnet ef database update
dotnet run
# API available at https://localhost:5000
# Swagger UI at https://localhost:5000/swagger
```

### Frontend

```sh
cd frontend

# Copy the dev env template and fill in values
cp .env.development .env.local
# Required variables:
#   NEXTAUTH_URL          = http://localhost:3000
#   NEXTAUTH_SECRET       = <random string>
#   NEXT_PUBLIC_BACKEND_API = http://localhost:5000/api/v1

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

### Backend (`appsettings.json`)

| Key | Description |
|-----|-------------|
| `ConnectionStrings:Development` | SQL Server connection string for local development |
| `ConnectionStrings:Stage` | Connection string for staging environment |
| `ConnectionStrings:Production` | Connection string for production environment |
| `AppSettings:JwtSecret` | Secret key used to sign JWT tokens |
| `AllowedOrigins` | CORS-allowed frontend origins |

## Docker

```sh
# Build and run the backend container
cd backend
docker build -t rms-api .
docker run -p 5000:80 rms-api
```

## API Reference

Full interactive docs are available at `/swagger` when running the backend in Development mode.

| Controller | Base path | Description |
|-----------|-----------|-------------|
| Auth | `/api/v1/auth` | Login and registration |
| User | `/api/v1/user` | User CRUD, password management |
| Project | `/api/v1/project` | Project CRUD, bulk import |
| WeekData | `/api/v1/weekdata` | Timesheet entries |
| Dashboard | `/api/v1/dashboard` | Analytics and metrics |
| Holiday | `/api/v1/holiday` | Company and personal holidays |
| Leave | `/api/v1/leave` | Leave records |
| Lock | `/api/v1/lock` | Lock / unlock timesheet periods |

See [`backend/README.md`](backend/ProjectProgressManagementSystem/README.md) for the full endpoint list.

## Project READMEs

- [Backend README](backend/ProjectProgressManagementSystem/README.md)
- [Frontend README](frontend/README.md)

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your changes with a clear message.
4. Push and open a pull request against `main`.

## License

MIT License. See `LICENSE` for details.
