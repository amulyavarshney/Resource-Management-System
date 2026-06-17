# Backend — ProjectProgressManagementSystem

ASP.NET Core 6 Web API for the Resource Management System. Provides all business logic, data access, and authentication.

## Technology

| Component | Version |
|-----------|---------|
| .NET / ASP.NET Core | 6.0 |
| Entity Framework Core | 7.0 |
| SQL Server provider | EF Core 7.0 |
| JWT authentication | Microsoft.AspNetCore.Authentication.JwtBearer 6.0 |
| Swagger / OpenAPI | Swashbuckle.AspNetCore 6.5 |
| Excel import | ExcelDataReader 3.6 |

## Project Structure

```
ProjectProgressManagementSystem/
├── Configuration/          # Typed config models (AppSettings)
├── Controllers/            # API controllers (one per resource)
├── DataAccess/             # EF Core DbContext
├── Exceptions/             # Custom exception types
├── Extensions/             # Startup wiring, ChangeTracker helpers, Excel reader, parsers
├── Filters/                # Global exception handler filter
├── Maps/
│   ├── Base/               # Abstract mapper base
│   └── ModelMappers/       # Entity ↔ ViewModel mapping + password hashing
├── Migrations/             # EF Core migration files
├── Models/                 # Database entity models and enums
├── Services/
│   ├── Interfaces/         # Service contracts
│   └── Implementations/    # Business logic
└── ViewModels/             # Request / response DTOs
```

## Setup

### Prerequisites

- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- SQL Server (local instance or Azure SQL)
- `dotnet ef` CLI tool: `dotnet tool install --global dotnet-ef`

### Configuration

Edit `appsettings.json` before running:

```jsonc
{
  "ConnectionStrings": {
    "Development": "Server=<host>;Database=<db>;User ID=<user>;Password=<pass>;TrustServerCertificate=true"
  },
  "AppSettings": {
    "JwtSecret": "<your-strong-secret-min-32-chars>"
  },
  "AllowedOrigins": [ "http://localhost:3000" ]
}
```

> **Never commit real credentials.** Use [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) or environment variable overrides in production.

### Run locally

```sh
dotnet restore
dotnet ef database update      # applies all migrations
dotnet run                     # starts on https://localhost:5000
```

Swagger UI: `https://localhost:5000/swagger`

### Docker

```sh
# From the backend/ directory
docker build -t rms-api .
docker run -p 5000:80 \
  -e ConnectionStrings__Development="<conn>" \
  -e AppSettings__JwtSecret="<secret>" \
  rms-api
```

## Data Models

### Entities

| Entity | Primary Key | Key Fields |
|--------|------------|------------|
| `User` | `int Id` | `EmpId`, `Email`, `PasswordHash/Salt`, `Department`, `Region`, `Role`, `WorkHoursPerDay`, `ParentId` |
| `Project` | `int Id` | `Number`, `Title`, `Business`, `Department`, `Region` |
| `WeekData` | `(UserId, ProjectId, Year, Month)` | `Week1`–`Week5` (hours) |
| `Holiday` | `(Date, Region)` | `Name`, `Type` |
| `PersonalHoliday` | `(Date, UserId)` | `Name`, `Type`, `Show` |
| `Leave` | `(Date, UserId)` | `Type` (Casual/Planned/Sick/Unplanned), `Session` (FullDay/HalfDay) |

All entities that inherit `EntityBase` carry `DateCreated`, `DateModified`, and `DateDeleted` (soft delete).

### Enums

| Enum | Values |
|------|--------|
| `Department` | `D1 = 1`, `D2 = 2` (Flags) |
| `Region` | `India = 1`, `USA = 2` (Flags) |
| `Role` | `Employee = 0`, `Management = 1`, `Executive = 2`, `Admin = 3`, `Developer = 4` |
| `LeaveType` | `Casual`, `Planned`, `Sick`, `Unplanned` |
| `LeaveSession` | `FullDay`, `HalfDay` |
| `HolidayType` | `Compulsory`, `Festival` |

## API Endpoints

All routes are prefixed with `/api/v1/`. All routes except `/auth/login` and `/auth/register` require a valid Bearer token.

---

### Auth — `/api/v1/auth`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/login` | None | `{ email, password }` | JWT token string |
| `POST` | `/register` | None | `UserCreateViewModel` | `MessageViewModel` |

---

### User — `/api/v1/user`

| Method | Path | Query params | Body | Response |
|--------|------|-------------|------|----------|
| `GET` | `/` | `department?`, `region?` | — | `UserViewModel[]` |
| `GET` | `/managers` | `department?`, `region?` | — | `UserViewModel[]` |
| `GET` | `/{year}/{month}` | `department?`, `region?` | — | `UserViewModel[]` |
| `GET` | `/{year}/{month}/parent/{parentId}` | `department?`, `region?` | — | `UserViewModel[]` |
| `GET` | `/{id}` | — | — | `UserViewModel` |
| `POST` | `/` | — | `UserCreateViewModel` | `UserViewModel` |
| `POST` | `/import` | — | Excel file (multipart) | `MessageViewModel` |
| `PATCH` | `/{id}` | — | `UserUpdateViewModel` | `UserViewModel` |
| `PATCH` | `/{id}/lastSavedTime` | — | `DateTime` | `UserViewModel` |
| `PATCH` | `/{id}/changePassword` | — | `PasswordCreateViewModel` | `MessageViewModel` |
| `PATCH` | `/{id}/removePassword` | — | `string` (current password) | `MessageViewModel` |
| `DELETE` | `/{id}` | `deleteNow?` (bool) | — | `MessageViewModel` |
| `DELETE` | `/reset` | — | — | `MessageViewModel` |

> `deleteNow=false` (default) schedules deletion on the first day of the next month. `deleteNow=true` performs immediate hard delete.

---

### Project — `/api/v1/project`

| Method | Path | Query params | Body | Response |
|--------|------|-------------|------|----------|
| `GET` | `/` | `department?`, `region?` | — | `ProjectViewModel[]` |
| `GET` | `/{year}/{month}` | `department?`, `region?` | — | `ProjectViewModel[]` |
| `GET` | `/{id}` | — | — | `ProjectViewModel` |
| `POST` | `/` | — | `ProjectCreateViewModel` | `ProjectViewModel` |
| `POST` | `/import` | — | Excel file (multipart) | `MessageViewModel` |
| `PATCH` | `/{id}` | — | `ProjectUpdateViewModel` | `ProjectViewModel` |
| `DELETE` | `/{id}` | `deleteNow?` (bool) | — | `MessageViewModel` |
| `DELETE` | `/reset` | — | — | `MessageViewModel` |

---

### WeekData (Timesheets) — `/api/v1/weekdata`

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/` | — | All week data |
| `GET` | `/{year}/{month}` | — | `WeekDataViewModel[]` for period |
| `GET` | `/{userId}/{projectId}/{year}/{month}` | — | `WeekDataViewModel` |
| `POST` | `/{userId}/{projectId}/{year}/{month}` | `WeekDataViewModel` | `WeekDataViewModel` |
| `PUT` | `/{userId}/{projectId}/{year}/{month}` | `WeekDataViewModel` | `WeekDataViewModel` |
| `POST` | `/import` | Excel file (multipart) | `MessageViewModel` |
| `DELETE` | `/{userId}/{projectId}/{year}/{month}` | — | `MessageViewModel` |
| `DELETE` | `/reset` | — | `MessageViewModel` |

`WeekDataViewModel`: `{ week1, week2, week3, week4, week5? }` — hours (decimal) per week.

---

### Dashboard — `/api/v1/dashboard`

| Method | Path | Query params | Response |
|--------|------|-------------|----------|
| `GET` | `/{year}/{month}` | `department?`, `region?` | `DashboardViewModel` |
| `GET` | `/{year}/{month}/project` | `department?`, `region?` | `ProjectDashboardViewModel[]` |
| `GET` | `/{year}/{month}/project/{projectId}` | — | `ProjectDashboardViewModel` |
| `GET` | `/project/{projectId}` | — | `ProjectDashboardViewModel` (all-time) |
| `GET` | `/{year}/{month}/user` | `department?`, `region?` | `UserDashboardViewModel[]` |
| `GET` | `/{year}/{month}/user/{userId}` | — | `UserDashboardViewModel` |
| `GET` | `/user/{userId}` | — | `UserDashboardViewModel` (all-time) |
| `GET` | `/{year}/{month}/parent/{parentId}` | `region?` | `UserDashboardViewModel[]` (team tree) |
| `GET` | `/{year}/{month}/users-with-unfilled-timesheet` | `department?`, `region?` | `UserDashboardViewModel[]` |

---

### Holiday — `/api/v1/holiday`

| Method | Path | Query / body | Response |
|--------|------|-------------|----------|
| `GET` | `/all` | `region?` | `Holiday[]` (all company holidays) |
| `GET` | `/personal` | `userId?`, `region?` | `PersonalHoliday[]` |
| `GET` | `/{year}` | `userId?`, `region?` | `Holiday[]` for year |
| `GET` | `/{year}/{month}` | `userId?`, `region?` | `Holiday[]` for month |
| `GET` | `/` | `date` (required), `userId?`, `region?` | `HolidayViewModel` |
| `POST` | `/` | Body: `HolidayBase` + `userId?`/`region?` | `HolidayViewModel` |
| `POST` | `/importHolidays` | Excel file (multipart) | `MessageViewModel` |
| `POST` | `/importPersonalHolidays` | Excel file (multipart) | `MessageViewModel` |
| `PATCH` | `/` | `date`, `region`, Body: `HolidayUpdateViewModel` | `HolidayViewModel` |
| `PATCH` | `/{userId}` | `date`, Body: `HolidayUpdateViewModel` | `HolidayViewModel` |
| `DELETE` | `/` | `date`, `userId?`, `region?` | `MessageViewModel` |
| `DELETE` | `/resetHolidays` | — | `MessageViewModel` |
| `DELETE` | `/resetPersonalHolidays` | — | `MessageViewModel` |
| `DELETE` | `/reset` | — | `MessageViewModel` |

---

### Leave — `/api/v1/leave`

| Method | Path | Query / body | Response |
|--------|------|-------------|----------|
| `GET` | `/` | `date?` | `Leave[]` |
| `GET` | `/{userId}` | `date?` | `Leave[]` for user |
| `GET` | `/{year}/{month}/{userId}` | — | `Leave[]` for user in period |
| `POST` | `/` | `LeaveCreateViewModel` | `Leave` |
| `POST` | `/add` | `LeaveCreateViewModel[]` | `MessageViewModel` |
| `POST` | `/import` | Excel file (multipart) | `MessageViewModel` |
| `DELETE` | `/{userId}` | `date` (required) | `MessageViewModel` |
| `DELETE` | `/reset` | — | `MessageViewModel` |

---

### Lock — `/api/v1/lock`

| Method | Path | Query params | Response |
|--------|------|-------------|----------|
| `GET` | `/` | `department?`, `region?` | `bool` — whether period is locked |
| `POST` | `/` | `isLocked` (bool), `department?`, `region?` | `MessageViewModel` |

---

## Authentication

All protected endpoints require an `Authorization: Bearer <token>` header. Obtain a token via `POST /api/v1/auth/login`. Tokens are signed HS512, expire after 2 hours.

## Database Migrations

```sh
# Create a new migration after model changes
dotnet ef migrations add <MigrationName>

# Apply pending migrations
dotnet ef database update

# Revert to a specific migration
dotnet ef database update <MigrationName>
```

## Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET /health/live` | Liveness — returns 200 if the process is up |
| `GET /health/ready` | Readiness — checks SQL Server connectivity |
