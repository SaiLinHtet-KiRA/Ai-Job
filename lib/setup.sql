-- Run this in Supabase SQL Editor to create the required tables.

-- ── titles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS titles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  jobs_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE titles ENABLE ROW LEVEL SECURITY;

ALTER TABLE titles ADD COLUMN IF NOT EXISTS jobs_size INTEGER NOT NULL DEFAULT 0;

CREATE POLICY admin_full_access_titles ON titles
  FOR ALL USING (true) WITH CHECK (true);

-- ── locations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  jobs_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

ALTER TABLE locations ADD COLUMN IF NOT EXISTS jobs_size INTEGER NOT NULL DEFAULT 0;

CREATE POLICY admin_full_access_locations ON locations
  FOR ALL USING (true) WITH CHECK (true);

-- ── job_listings (ingested from RSS / TheirStack) ──────────
CREATE TABLE IF NOT EXISTS job_listings (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  salary_range TEXT,
  skills JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  apply_url TEXT,
  apply_email TEXT,
  source TEXT NOT NULL DEFAULT 'mock',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_job_listings ON job_listings
  FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_listings_external ON job_listings (source, external_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_skills ON job_listings USING GIN (skills);

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

-- ── user_cvs (CV storage & parsed data) ───────────────────────
CREATE TABLE IF NOT EXISTS user_cvs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_text TEXT,
  structured_data JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_own_cv ON user_cvs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY admin_full_access_user_cvs ON user_cvs
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_cvs_user ON user_cvs (user_id);

-- ── applications (legacy – apply form) ────────────────────────
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

-- add columns for the authenticated apply flow (migration-safe)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_id BIGINT REFERENCES job_listings(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cv_id BIGINT REFERENCES user_cvs(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'email';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- add email column to existing applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- ── cv_scores ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_scores (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_kb INTEGER NOT NULL,
  score INTEGER NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  keywords_missing JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cv_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_cv_scores ON cv_scores
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cv_scores_ip ON cv_scores (ip_address);
CREATE INDEX IF NOT EXISTS idx_cv_scores_email ON cv_scores (email);

-- ── leads ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  cv_score_id BIGINT REFERENCES cv_scores(id),
  source TEXT NOT NULL DEFAULT 'cv_score',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_leads ON leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);

-- ── courses ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'other',
  duration TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_courses ON courses
  FOR ALL USING (true) WITH CHECK (true);

-- ── roles (reference lookup) ────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_roles ON roles
  FOR ALL USING (true) WITH CHECK (true);

-- ── role_courses (many-to-many: role → courses) ────────────
CREATE TABLE IF NOT EXISTS role_courses (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE role_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_role_courses ON role_courses
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_role_courses_role ON role_courses (role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_role_courses_unique ON role_courses (role, course_id);

-- ── user_profiles (parsed CV data for matching) ────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  password TEXT,
  skills JSONB NOT NULL DEFAULT '[]',
  experience_level TEXT DEFAULT 'mid',
  target_roles JSONB NOT NULL DEFAULT '[]',
  preferred_locations JSONB NOT NULL DEFAULT '[]',
  remote_ok BOOLEAN DEFAULT true,
  cv_file_url TEXT,
  cv_text TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  last_scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_user_profiles ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN (skills);

-- add status column if missing (migration)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT chk_user_profiles_status CHECK (status IN ('active', 'banned'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── daily_matches (cron output: user → matched jobs) ───────
CREATE TABLE IF NOT EXISTS daily_matches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id BIGINT NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL,
  missing_skills JSONB NOT NULL DEFAULT '[]',
  tailored_cv_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  acted_at TIMESTAMPTZ
);

ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_daily_matches ON daily_matches
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_daily_matches_user ON daily_matches (user_id, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_matches_status ON daily_matches (user_id, status);

-- ── applications_sent (audit log) ─────────────────────────
CREATE TABLE IF NOT EXISTS applications_sent (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id BIGINT NOT NULL REFERENCES daily_matches(id),
  job_id BIGINT NOT NULL REFERENCES job_listings(id),
  method TEXT NOT NULL DEFAULT 'email',
  sent_to TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent',
  response_status TEXT
);

ALTER TABLE applications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_full_access_applications_sent ON applications_sent
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_applications_sent_user ON applications_sent (user_id, sent_at DESC);

-- ── applications: RLS & indices ────────────────────────────

CREATE POLICY user_own_applications ON applications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY admin_full_access_applications ON applications
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications (job_id);
