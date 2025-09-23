# Database Migrations

The `db` directory contains SQL assets for the Maintenance backend.

- `schema.sql` – canonical reference of the relational model. It can be applied
  to provision a brand-new database, and is referenced by the migrations.
- `migrations/001_initial_schema.sql` – wraps `schema.sql` in a transaction so
  it can be executed via `psql` or any migration runner that understands
  PostgreSQL scripts.

## Running the initial migration

1. Export a `DATABASE_URL` that points to your PostgreSQL instance, for example:

   ```bash
   export DATABASE_URL="postgres://postgres:postgres@localhost:5432/maintenance"
   ```

2. Execute the migration using `psql`:

   ```bash
   psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
   ```

The scripts assume the `pgcrypto` extension is available (it is part of the
default PostgreSQL distribution). If it is missing, enable it with:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```
