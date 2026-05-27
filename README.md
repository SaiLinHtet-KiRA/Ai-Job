# easy2apply

AI-powered job matching platform — one form, hundreds of applications, personalized study roadmap.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Language**: TypeScript

## Features

- **One-click apply** — Single form submits your resume to all matching employers
- **Employer matching** — Auto-matches your target position with relevant job listings
- **Email notifications** — Both applicants and employers receive branded email notifications
- **Study roadmap** — Personalized learning path with curated courses and time estimates
- **Admin dashboard** — Manage jobs, titles, and admin users via a protected admin panel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project with database
- Resend API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) |
| `ADMIN_EMAIL` | Default admin login email |
| `ADMIN_PASSWORD` | Default admin login password |
| `RESEND_API_KEY` | Resend API key for sending emails |

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
CREATE TABLE titles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE jobs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  title_id BIGINT REFERENCES titles(id),
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  location TEXT DEFAULT '',
  type TEXT DEFAULT 'On-site',
  salary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  type TEXT NOT NULL,
  salary TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Seed Data

```bash
node add-data/index.js
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── admin/            # Admin dashboard (auth, jobs, admins CRUD)
│   ├── api/              # API routes (jobs, titles, apply, admin)
│   ├── data/             # Seed data (job.json, study-roadmaps.json)
│   ├── results/          # Results page (job matches + study roadmap)
│   ├── globals.css       # Global styles + Tailwind theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ApplyModal.tsx    # Job application modal
│   └── TitleSelector.tsx # Searchable title dropdown
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Admin auth (HMAC cookies)
│   └── email.ts          # Email templates (Resend)
└── add-data/
    └── index.js          # Database seed script
```

## Admin Panel

Access at `/admin`. Default credentials are set in `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

- **Dashboard** — Stats overview and quick actions
- **Jobs** — Create, edit, and delete job listings
- **Admins** — Manage admin users
