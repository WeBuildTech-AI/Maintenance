-- ============================================================================
-- Migration: 001_initial_schema
-- Applies the base database schema for the Maintenance platform.
-- Usage: psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
-- ============================================================================

BEGIN;
\i ../schema.sql
COMMIT;
