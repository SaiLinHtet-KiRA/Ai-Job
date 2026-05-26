-- Run this in Supabase SQL Editor to create the required tables.

-- ── policies: drop first so re-runs are idempotent ────────────
DROP POLICY IF EXISTS admin_full_access_titles ON titles;
DROP POLICY IF EXISTS admin_full_access_jobs ON jobs;
DROP POLICY IF EXISTS admin_full_access_admins ON admins;
DROP POLICY IF EXISTS admin_full_access_applications ON applications;

-- ── titles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS titles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_titles ON titles
  FOR ALL USING (true) WITH CHECK (true);

-- ── jobs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  title_id BIGINT REFERENCES titles(id) ON DELETE SET NULL,
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'On-site',
  salary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- add columns to existing table (safe if run before the table was created)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title_id BIGINT REFERENCES titles(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary TEXT NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE POLICY admin_full_access_jobs ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- ── admins ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_admins ON admins
  FOR ALL USING (true) WITH CHECK (true);

-- ── applications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL,
  type TEXT NOT NULL,
  salary TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- add email column to existing applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

CREATE POLICY admin_full_access_applications ON applications
  FOR ALL USING (true) WITH CHECK (true);
