# Maintenance Backend

NestJS service that powers the Maintenance platform APIs. It currently exposes
in-memory implementations for all endpoints so the API contract can be exercised
while the persistent layer is being built.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (required once you wire the API to the real database schema)

## Quick start

```bash
npm install
npm run start:dev
```

The server boots on port `3000` by default and mounts the API under
`/api/v1/…`. A health probe is available at `GET /api/v1/health`.

## Available endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- CRUD endpoints for users, organizations, teams, vendors, parts, locations,
  assets, meters, procedures, categories, automations, work orders,
  purchase-orders, inventory, attachments, and audit-logs.
- Work order helpers: `POST /api/v1/work-orders/:id/assign` and
  `POST /api/v1/work-orders/:id/comment`.

Each module currently returns mocked in-memory data. Replace the logic in the
services with database repositories when ready.

## Database assets

The `db/` folder contains hand-written PostgreSQL SQL scripts that mirror the
schema used by the API contracts. Apply the migrations with `psql`:

```bash
psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
```

## Next steps

1. Replace the in-memory services with real repositories (TypeORM/Prisma/etc.).
2. Introduce request authentication/authorization.
3. Add e2e tests around the HTTP layer once persistence is wired in.
