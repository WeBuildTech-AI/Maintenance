-- ============================================================================
-- Maintenance Platform Database Schema
-- ============================================================================
-- This file captures the full relational model used by the Maintenance backend.
-- All objects are created in dependency order so it can be applied standalone.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types -----------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'viewer');
CREATE TYPE industry_type AS ENUM ('manufacturing', 'real_estate', 'healthcare', 'hospitality', 'education', 'other');
CREATE TYPE asset_criticality AS ENUM ('high', 'medium', 'low');
CREATE TYPE meter_type AS ENUM ('electricity', 'water', 'gas', 'runtime');
CREATE TYPE po_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'completed', 'cancelled');
CREATE TYPE procedure_type AS ENUM ('maintenance', 'inspection', 'safety_check');
CREATE TYPE procedure_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE work_order_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE category_icon AS ENUM ('wrench', 'bolt', 'gear', 'electric', 'plumbing', 'hvac');

-- Tables ---------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry industry_type,
    size INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_escalation_team BOOLEAN DEFAULT FALSE,
    critical_parts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    color VARCHAR(7),
    description TEXT,
    contacts JSONB,
    files TEXT[],
    vendor_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photo_urls TEXT[],
    address TEXT,
    description TEXT,
    teams_in_charge UUID[],
    files TEXT[],
    vendor_ids UUID[],
    parent_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photos TEXT[],
    unit_cost NUMERIC(12, 2),
    description TEXT,
    qr_code VARCHAR(255) UNIQUE,
    parts_type VARCHAR(100)[],
    location JSONB,
    asset_ids UUID[],
    teams_in_charge UUID[],
    vendor_ids UUID[],
    files TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pictures TEXT[],
    files TEXT[],
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    criticality asset_criticality,
    year INT,
    warranty_date DATE,
    is_under_warranty BOOLEAN,
    is_under_amc BOOLEAN,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    teams_in_charge UUID[],
    qr_code VARCHAR(255) UNIQUE,
    asset_type_id VARCHAR(255),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    part_ids UUID[],
    parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    meter_type meter_type,
    description TEXT,
    unit VARCHAR(50),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    reading_frequency JSONB,
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    asset_ids UUID[],
    type procedure_type,
    frequency procedure_frequency,
    description TEXT,
    files TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category_icon category_icon,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    pictures TEXT[],
    description TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    asset_ids UUID[],
    procedure_ids UUID[],
    assignee_ids UUID[],
    estimated_time_hours NUMERIC(10, 2),
    due_date DATE,
    start_date DATE,
    recurrence_rule TEXT,
    work_type VARCHAR(100),
    priority work_order_priority,
    files TEXT[],
    part_ids UUID[],
    category_ids UUID[],
    vendor_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    status po_status,
    items JSONB,
    taxes_and_costs JSONB,
    shipping_address TEXT,
    billing_address TEXT,
    shipping_contact JSONB,
    due_date DATE,
    notes TEXT,
    files TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    triggers JSONB,
    conditions JSONB,
    actions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    quantity INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX inventory_levels_organization_part_location_uidx
    ON inventory_levels (organization_id, part_id, location_id);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
