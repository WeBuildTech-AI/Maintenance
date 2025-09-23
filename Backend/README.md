# Maintenance Backend

NestJS service powering the Maintenance platform APIs. The backend now persists
data in PostgreSQL via Prisma, replacing the original in-memory stubs.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

Set `DATABASE_URL` to point at your database before running any Prisma command
(e.g. `export DATABASE_URL="postgres://postgres:postgres@localhost:5432/maintenance"`).

## Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate   # applies migrations to DATABASE_URL
npm run start:dev
```

`npm run db:migrate` runs an interactive development migration, while
`npm run prisma:migrate` applies the checked-in migrations without creating new
ones. Use `npm run db:reset` to wipe and reapply the schema in development.

## Available endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- CRUD endpoints for users, organizations, teams, vendors, parts, locations,
  assets, meters, procedures, categories, automations, work-orders,
  purchase-orders, inventory, attachments, and audit-logs.
- Work order helpers: `POST /api/v1/work-orders/:id/assign` and
  `POST /api/v1/work-orders/:id/comment`.

Responses now reflect records stored in PostgreSQL. The controllers return raw
Prisma entities without additional view-model transformations so that the REST
contract matches the database types.

## Database migrations

Prisma migrations live in `prisma/migrations/`. The initial migration was
produced via `prisma migrate diff` from `prisma/schema.prisma` and can be applied
with `npm run prisma:migrate`. Generated SQL closely mirrors the previous
hand-written scripts located under `db/`.

## Next steps

1. Add authentication/authorization that issues signed tokens.
2. Harden DTO validation and response serialization as the data model evolves.
3. Extend the test suite with integration scenarios that exercise Prisma.
