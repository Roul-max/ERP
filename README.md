# ACE-ERP (University ERP)

ACE-ERP is a full-stack University ERP (Enterprise Resource Planning) system with role-based access for **Admin**, **Faculty**, and **Student** users.

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Auth**: JWT (Bearer token), role-based authorization
- **Monorepo**: `frontend/` + `backend/` + shared root scripts

## What’s included

### Roles & capabilities

**Admin**
- Manage students, staff (HR/Payroll), courses, academics (batches)
- Manage finance (fees), hostel rooms, library catalog, timetable
- Upload/manage documents
- Send notifications (in-app broadcasts; email broadcasts are planned but not sent)
- View analytics dashboard (overview charts/aggregations)
- Update institution settings

**Faculty**
- View course list and **My Courses**
- Mark attendance for a course/date
- Create exams and publish results
- View student list (read-only access) for operational workflows

**Student**
- View **My Attendance**, **My Fees**, and **My Results**
- View/download shared documents and library catalog
- Receive notifications (in-app)

### Main modules (API)
All APIs are served under `/api/v1`.

- `auth` (login, profile, preferences, password reset, avatar, Google OAuth simulator)
- `students` (CRUD; admin write, faculty read)
- `courses` (CRUD; faculty “my courses”)
- `attendance` (mark + student view)
- `exams` (create exam + results)
- `finance` (fees + student payments)
- `notifications` (broadcasts + inbox)
- `library` (books)
- `hostel` (rooms)
- `timetable` (scheduler entries)
- `documents` (file uploads/downloads)
- `academics` (batches + stats)
- `staff` (HR + payroll summary)
- `settings` (institution settings)
- `analytics` (overview for admin)

## Repo structure

```
ACE-ERP/
  backend/              # Express API + Mongo models
  frontend/             # React app (HashRouter)
  scripts/dev.mjs       # Runs backend + frontend together
  docker-compose.yml    # Optional: dockerized backend/frontend/mongo
```

## Prerequisites

- Node.js 18+ (recommended: 20+)
- MongoDB:
  - Local MongoDB (service) OR
  - Docker (recommended for local DB) OR
  - MongoDB Atlas connection string

## Quick start (local dev)

### 1) Configure environment variables

Backend:
1. Copy `backend/.env.example` → `backend/.env`
2. Set at minimum:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (usually `http://localhost:5173`)

Frontend:
1. Copy `frontend/.env.example` → `frontend/.env`
2. For local dev, keep `VITE_API_URL` empty to use the Vite proxy.
   - The Vite dev proxy targets `http://localhost:5001` (see `frontend/vite.config.ts`).
   - If you run the backend on a different port, either update the proxy or set `VITE_API_URL`.

### 2) Install dependencies
From the repo root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

If PowerShell blocks scripts on your machine, try `npm.cmd` instead of `npm`.

### 3) Start MongoDB (optional)

If you want Docker to run MongoDB for you:

```bash
npm run dev:db
```

This runs `docker compose up -d mongo` using the `docker-compose.yml` service.

### 4) Run the apps

Run both backend + frontend together:

```bash
npm run dev
```

Or individually:

```bash
npm run dev:backend
npm run dev:frontend
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001` (when using `backend/.env.example`)
- Health check: `GET http://localhost:5001/api/v1/health`

## Seed data (recommended for demo)

The backend auto-seeds a single admin user **on server startup** if no admin exists:
- `admin@university.com` / `admin123`

For richer demo data (students, faculty, courses, fees, exams, timetable, docs, etc.), run:

```bash
npm --prefix backend run seed
```

Seed script includes demo users such as:
- Admin: `admin@university.com` / `admin123`
- Faculty: `faculty@university.com` / `faculty123`
- Students: created in bulk with password `student123`

To wipe data in a dev database, the seed script supports a guarded reset mode:

```bash
# PowerShell
$env:SEED_RESET="true"; npm --prefix backend run seed -- --reset

# macOS/Linux
SEED_RESET=true npm --prefix backend run seed -- --reset
```

## Authentication model

- Login returns a JWT token.
- For protected endpoints, send:
  - `Authorization: Bearer <token>`
- Roles are enforced in the backend via `protect` + `authorize(...)` middleware.

## API reference (high level)

Base URL: `http://localhost:5001/api/v1`

### Auth (`/auth`)
- `POST /auth/login`
- `POST /auth/forgot-password` (prints reset link to server console; no email provider)
- `PUT /auth/reset-password/:resettoken`
- `GET /auth/me`
- `PUT /auth/profile`
- `PUT /auth/change-password`
- `PUT /auth/avatar` (base64 data URL; max 500KB; png/jpg/webp)
- `DELETE /auth/avatar`
- `GET /auth/preferences`
- `PUT /auth/preferences`
- `GET /auth/google` + `GET /auth/google/callback` (OAuth simulator)

### Students (`/students`)
- `POST /students` (admin)
- `GET /students` (admin, faculty)
- `PUT /students/:id` (admin)
- `DELETE /students/:id` (admin)

### Courses (`/courses`)
- `POST /courses` (admin)
- `GET /courses` (admin, faculty, student)
- `GET /courses/my` (faculty)
- `GET /courses/:id` (admin, faculty, student)
- `PUT /courses/:id` (admin)
- `DELETE /courses/:id` (admin)

### Attendance (`/attendance`)
- `POST /attendance` (admin, faculty) — `{ courseId, date, records[] }`
- `GET /attendance/my` (student)

### Exams (`/exams`)
- `POST /exams` (admin, faculty)
- `GET /exams/faculty` (admin, faculty)
- `POST /exams/results` (admin, faculty) — creates/updates result, calculates grade
- `GET /exams/my-results` (student)
- `GET /exams/:id/results` (admin, faculty)

### Finance (`/finance`)
- `POST /finance` (admin) — create fee
- `GET /finance/all` (admin)
- `GET /finance/my` (student)
- `PUT /finance/:id/pay` (student)

### Notifications (`/notifications`)
- `POST /notifications` (admin) — send to a user or broadcast to roles
- `GET /notifications` (any authenticated user)
- `PUT /notifications/:id/read` (any authenticated user)
- `GET /notifications/broadcasts` (admin) — list broadcasts created by the current admin

### Documents (`/documents`)
- `GET /documents` (any authenticated user)
- `GET /documents/:id/download` (any authenticated user)
- `POST /documents` (admin) — base64 upload (max 15MB); stores file under `backend/uploads/documents`
- `DELETE /documents/:id` (admin)

### Admin-only modules
- `GET /analytics/overview` (admin)
- `GET /settings` (any authenticated user; lazily initializes defaults)
- `PUT /settings` (admin)
- `GET /academics/batches` (admin)
- `POST /academics/batches` (admin)
- `PUT /academics/batches/:id` (admin)
- `DELETE /academics/batches/:id` (admin)
- `GET /academics/stats/batches` (admin)
- `GET /staff` (admin)
- `POST /staff` (admin)
- `PUT /staff/:id` (admin)
- `DELETE /staff/:id` (admin)
- `GET /staff/payroll/summary?month=YYYY-MM` (admin)
- `POST /hostel` / `GET /hostel` / `PUT /hostel/:id` / `DELETE /hostel/:id` (admin)
- `POST /library` / `GET /library` / `PUT /library/:id` / `DELETE /library/:id` (admin write; all authenticated can read)
- `POST /timetable` / `GET /timetable` / `DELETE /timetable/:id` (admin write; all authenticated can read)

## Running with Docker

Build and run everything (backend + frontend + mongo):

```bash
docker compose up --build
```

Ports (from `docker-compose.yml`):
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

Note: the frontend container is built with `VITE_API_URL=http://localhost:5000` so browser requests go to the host-mapped backend port.

## Deployment notes

This repo is commonly deployed as:
- Frontend on Vercel
- Backend on Render

For production, set:
- Backend: `FRONTEND_URL` to your frontend origin (for CORS)
- Frontend: `VITE_API_URL` to your backend origin

## Troubleshooting

- **Mongo connection refused (localhost:27017):** start MongoDB locally or run `npm run dev:db`.
- **Atlas auth failed:** verify DB user/password, URL-encode special chars, and wrap `MONGO_URI` in quotes in `backend/.env`.
- **Atlas DNS/SRV issues:** set `DNS_SERVERS=1.1.1.1,8.8.8.8` in `backend/.env`.
- **CORS errors:** ensure `FRONTEND_URL` matches where the frontend is served from.
- **Document uploads in prod:** documents are stored on the backend filesystem (`backend/uploads/documents`). Use persistent storage in your hosting environment or switch to object storage if needed.
