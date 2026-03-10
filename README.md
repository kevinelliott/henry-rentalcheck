# RentalCheck — Maintenance Request Management

A Next.js 14 (App Router, TypeScript, Tailwind CSS) web app for managing rental property maintenance requests.

## Features

- **Tenant-facing form** — Mobile-first submission form with property/unit selection, request type, urgency level, and description
- **Token-based status tracking** — Tenants receive a unique token to check their request status without an account
- **Landlord dashboard** — Filterable table of all requests with stats by status and property
- **Request management** — Update status, add notes visible to tenants
- **Properties & Units CRUD** — Manage your portfolio from the dashboard
- **JWT session auth** — Password-protected landlord portal with 7-day sessions

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- bcryptjs (password hashing)
- jose (JWT)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. Run the migration:

```bash
# In the Supabase SQL editor, run:
supabase/migrations/001_init.sql
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LANDLORD_PASSWORD_HASH=your-bcrypt-hash
JWT_SECRET=your-random-secret
```

**Generating a password hash:**

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(console.log)"
```

**Generating a JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Description |
|------|-------------|
| `/submit` | Tenant maintenance request form |
| `/status/[token]` | Tenant status tracking page |
| `/login` | Landlord login |
| `/dashboard` | Request management dashboard |
| `/dashboard/requests/[id]` | Request detail & update |
| `/dashboard/properties` | Properties & units management |

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login with password |
| POST | `/api/auth/logout` | — | Clear session |
| GET | `/api/requests` | Yes | List all requests |
| POST | `/api/requests` | — | Create request |
| GET | `/api/requests/[id]` | Yes | Get single request |
| PATCH | `/api/requests/[id]` | Yes | Update status/notes |
| GET | `/api/properties` | — | List properties |
| POST | `/api/properties` | Yes | Create property |
| DELETE | `/api/properties/[id]` | Yes | Delete property |
| PATCH | `/api/properties/[id]` | Yes | Update property |
| GET | `/api/units?propertyId=X` | — | List units for property |
| POST | `/api/units` | Yes | Create unit |
