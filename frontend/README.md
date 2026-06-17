# Frontend — Resource Management System

Next.js 14 web application for the Resource Management System. Provides the complete UI: timesheet entry, dashboards, admin controls, leave/holiday management, and user profiles.

## Technology

| Package | Version |
|---------|---------|
| Next.js | 14.2 |
| React | 18.3 |
| TypeScript | 5.1 |
| Tailwind CSS | 3.3 |
| NextAuth.js | 4.22 |
| Axios | 1.4 |
| react-hot-toast | 2.4 |
| xlsx-js-style | 1.2 |

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                   # Root layout — AuthProvider, Toaster
│   ├── page.tsx                     # Root redirect (→ /auth or /home)
│   ├── (pages)/                     # Protected route group
│   │   ├── layout.tsx               # Shared layout with Navbar + auth guard
│   │   ├── home/                    # Landing page
│   │   ├── timesheet/               # Timesheet entry
│   │   ├── view/                    # View past timesheets
│   │   ├── dashboard/               # Analytics dashboards
│   │   │   ├── project/[id]/
│   │   │   └── user/[id]/
│   │   ├── profile/                 # User profile and settings
│   │   ├── admin/                   # Admin panel
│   │   │   └── users-with-unfilled-timesheet/
│   │   └── holidays/                # Holiday list
│   ├── auth/                        # Public auth pages (login, register, reset)
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth route handler
│   │   ├── mail/                    # Email report service
│   │   └── services/                # Typed Axios API clients
│   ├── components/                  # Shared UI components
│   └── contexts/                    # React Context providers
├── public/                          # Static assets (SVGs, images)
├── next.config.js                   # Next.js config + security headers
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Setup

### Prerequisites

- Node.js 18 LTS or later
- npm 9 or later
- A running instance of the backend API

### Install and run

```sh
npm install
npm run dev        # http://localhost:3000
```

### Build for production

```sh
npm run build
npm start
```

### Other scripts

```sh
npm run lint       # ESLint
npm run format     # Prettier
```

## Environment Variables

Create `.env.local` for local overrides (not committed). The committed `.env.development` and `.env.production` files contain non-secret defaults.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Canonical URL of this app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Secret for signing NextAuth JWTs — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_FRONTEND_URL` | Yes | Public base URL of this app |
| `NEXT_PUBLIC_BACKEND_API` | Yes | Backend API base URL (e.g. `http://localhost:5000/api/v1`) |

## Authentication

Authentication is handled by [NextAuth.js](https://next-auth.js.org/) with a Credentials provider that calls `POST /api/v1/auth/login` on the backend. On success the JWT from the backend is stored in the NextAuth session and attached to every subsequent API request via Axios.

The session token carries: `id`, `email`, `role`, `department`, `region`, `empId`, `firstName`, `lastName`, `parentId`, `workHoursPerDay`.

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/auth` | Public | Login / Register |
| `/auth/resetPassword` | Public | Request password reset |
| `/auth/changePassword/[id]` | Public | Set new password |
| `/home` | All roles | Landing page with upcoming holidays and timer |
| `/timesheet` | Employee, Management, Admin, Developer | Monthly timesheet entry and leave management |
| `/view` | Employee, Management, Admin, Developer | Read-only view of past timesheets with export |
| `/dashboard` | Management, Executive, Admin, Developer | Overview stats (projects, users, hours) |
| `/dashboard/project` | Management, Executive, Admin, Developer | Per-project dashboards |
| `/dashboard/project/[id]` | Management, Executive, Admin, Developer | Single project detail with user breakdown |
| `/dashboard/user` | Management, Executive, Admin, Developer | Per-user dashboards |
| `/dashboard/user/[id]` | Management, Executive, Admin, Developer | Single user detail with project breakdown |
| `/holidays` | All roles | Holiday calendar for the year |
| `/profile` | All roles | Edit profile details and password |
| `/admin` | Admin, Developer | User/project/holiday management, Excel import, timesheet lock |

## State Management

Global state uses React Context — no external state library.

| Context | Hook | State |
|---------|------|-------|
| `AuthContext` | (wraps NextAuth `SessionProvider`) | Session |
| `DateContext` | `useDate()` | `year`, `month` — current selected period |
| `SearchContext` | `useSearch()` | `search` — table filter string |
| `SettingsContext` | `useSettings()` | `showFavourites` — toggle favourite projects only |
| `ToasterContext` | (wraps react-hot-toast) | Toast notifications |
| `WeeksContext` | `useWeeks()` | `weeks` — week date ranges for current month |

## API Service Layer

All backend calls go through typed Axios clients in `app/api/services/`. Each file wraps one backend resource:

| File | Exported service | Key methods |
|------|-----------------|-------------|
| `auth.ts` | `authService` | `login`, `register` |
| `user.ts` | `userService` | `getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`, `getFullName` |
| `project.ts` | `projectService` | `getProjects`, `getProject`, `getProjectsByYearAndMonth`, `createProject`, `updateProject`, `deleteProject`, `importFromExcel` |
| `weekData.ts` | `weekDataService` | `getWorkHours`, `getWorkHour`, `createWorkHours`, `updateWorkHours`, `importFromExcel` |
| `leave.ts` | `leaveService` | `getLeaves`, `getLeavesInMonth`, `getLeavesCountInAWeek`, `addLeave`, `removeLeave` |
| `holiday.ts` | `holidayService` | `getAllHolidays`, `getHolidaysInMonth`, `getUpcomingHolidays`, `createHoliday`, `updateHoliday`, `deleteHoliday` |
| `dashboard.ts` | `dashboardService` | `getDashboard`, `getProjectDashboard`, `getProjectDashboardById`, `getUserDashboard`, `getUsersWithUnfilledTimesheet` |
| `lock.ts` | `lockService` | `getLock`, `setLock` |
| `userPreferences.ts` | `userPreferencesService` | Favourite project persistence |
| `weeksList.ts` | `weeksList` | `getWeeksInMonth`, `getMonthName`, `getDayName` |
| `utils.ts` | helpers | `sortProjects`, `sortUsers` |

## Security Headers

The following headers are applied to all responses via `next.config.js`:

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | `geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...` |
