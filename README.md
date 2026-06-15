# ai-job

AI-powered job matching platform — one form, hundreds of applications, personalized study roadmap.

CV scoring — free, no signup, instant ATS feedback powered by Gemini 2.5 Flash.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | HMAC-signed session cookies |
| Rate limiting | Upstash Redis (sliding window) |
| AI | Gemini 2.5 Flash (via @ai-sdk/google) |
| Email | Resend |
| Validation | Zod 4 |
| API docs | Scalar (next-openapi-gen) |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions → Vercel |
| Language | TypeScript |

## Features

- **CV scoring** — Upload a PDF/DOCX CV and get an AI-generated score, strengths, weaknesses, recommended job titles via Gemini 2.5 Flash
- **Real-time job matching** — Dashboard matches your CV's extracted job titles against job listings on page load
- **Bulk apply** — Select matching jobs, enter job type and expected salary, then send your CV to multiple employers at once
- **Email notifications** — Welcome emails, verification codes, score results, application confirmations. All emails logged to `email_logs` table
- **Study roadmap** — Personalized learning path with curated courses and time estimates
- **Notification bell** — Real-time notification center for job matches, application status, and system updates
- **Admin audit log** — All admin actions (user bans, job CRUD, data operations) tracked in `audit_logs`
- **Admin actions** — Manual triggers: ingest jobs, run matching, send digests, re-score CVs, cleanup old data, export database
- **Admin dashboard** — Full CRUD for job listings, titles, courses, and admin users behind session auth
- **Rate limiting** — Per-endpoint rate limits with graceful Redis-failure fallback
- **Input validation** — Zod schemas on all API endpoints with descriptive error messages
- **API documentation** — Interactive Scalar reference at `/api-docs`, auto-generated from JSDoc

## Getting Started

### Prerequisites

- Node.js 22+
- Supabase project
- Upstash Redis instance (rate limiting degrades gracefully if unavailable)
- Resend API key

### Setup

```bash
npm install
cp .env.example .env.local
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ADMIN_EMAIL` | Bootstrap admin email |
| `ADMIN_PASSWORD` | Bootstrap admin password |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key for CV scoring |
| `RESEND_API_KEY` | Resend API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `SESSION_SECRET` | HMAC secret for session cookie signing |

### Database

Run `lib/setup.sql` in your Supabase SQL editor. Creates tables for titles, job_listings, admins, and applications with RLS policies.

### Development

```bash
npm run dev         # http://localhost:3000
```

## API

25+ endpoints. All inputs validated with shared Zod schemas (`lib/validations.ts`).

### Public

| Method | Path | Description | Rate limit |
|--------|------|-------------|------------|
| `GET` | `/api/titles` | List all job titles | 30 / 10s |
| `GET` | `/api/jobs?title=` | Search job listings by keyword | 30 / 10s |
| `POST` | `/api/apply` | Submit application (multipart) | 5 / 60s |
| `POST` | `/api/score` | Score a CV (multipart: file + email) | 10 / hour |
| `POST` | `/api/leads` | Save email for CV score follow-up | — |

### Authenticated (requires NextAuth session)

| Method | Path | Description | Rate limit |
|--------|------|-------------|------------|
| `POST` `GET` | `/api/cv/upload` | Upload / get user CV | — |
| `DELETE` | `/api/cv/delete` | Delete user CV | — |
| `GET` `POST` | `/api/profile` | Get / update user profile | — |
| `POST` | `/api/apply/bulk` | Bulk apply to selected jobs | — |
| `GET` `PATCH` | `/api/notifications` | List / mark read user notifications | — |

### Admin (requires `admin_session` cookie)

| Method | Path | Description | Rate limit |
|--------|------|-------------|------------|
| `POST` | `/api/admin/login` | Authenticate | 5 / 60s |
| `POST` | `/api/admin/logout` | Clear session | 10 / 60s |
| `GET` `POST` | `/api/admin/titles` | List / create titles | 30 / 10s |
| `GET` `POST` | `/api/admin/job-listings` | List / create job listings | 30 / 10s |
| `DELETE` | `/api/admin/job-listings?id=` | Delete job listing | 30 / 10s |
| `GET` `POST` | `/api/admin/admins` | List / create admins | 30 / 10s |
| `PUT` `DELETE` | `/api/admin/admins/:id` | Update / delete admin | 30 / 10s |
| `GET` | `/api/admin/cv-scores` | List CV scores (paginated) | 30 / 10s |
| `GET` | `/api/admin/cv-scores/:id` | Get CV score detail | 30 / 10s |
| `GET` | `/api/admin/users` | List users (paginated, status/email filter) | — |
| `GET` | `/api/admin/users/stats` | Get user counts (total, active, banned) | — |
| `PATCH` | `/api/admin/users/:id` | Ban / unban user | — |
| `GET` | `/api/admin/job-applications` | List jobs with applications (paginated, ?search, ?job_id and ?ids detail) | — |
| `GET` | `/api/admin/courses` | List courses (paginated, with ?role filter) | — |
| `GET` | `/api/admin/courses/:id` | Get course detail with role links | — |
| `POST` | `/api/admin/courses` | Create course with role links | — |
| `PATCH` | `/api/admin/courses/:id` | Update course (fields + role links) | — |
| `DELETE` | `/api/admin/courses/:id` | Delete course | — |
| `POST` | `/api/admin/courses/bulk` | Bulk import courses (up to 500) | — |
| `GET` | `/api/admin/audit` | Audit log (paginated, action filter) | — |
| `GET` | `/api/admin/emails` | Email log (paginated, type/status filter) | — |
| `POST` | `/api/admin/actions` | Run admin actions (ingest, match, digest, rescore, cleanup, export) | — |

### API Docs

Interactive Scalar docs at `/api-docs`. The OpenAPI spec is auto-generated from JSDoc annotations on route handlers and served at `/openapi.json`.

```bash
npm run openapi:generate    # regenerate manually
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (+ OpenAPI gen) |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with UI |
| `npm run openapi:generate` | Regenerate OpenAPI spec |

## Testing

### Unit (Vitest) — 16 test files, 230+ tests

```
lib/__tests__/validations.test.ts   — 85+ tests for all Zod schemas
lib/__tests__/auth.test.ts          — password hashing, session tokens
lib/__tests__/rate-limit.test.ts    — IP parsing from headers
lib/__tests__/audit.test.ts         — logAuditAction helper
components/__tests__/               — NotificationCenter, ApplyModal, TitleSelector, LocationSelector, CVScoreCard, SignOutButton, Pagination
app/components/__tests__/           — TopNav (auth states), CVManager (upload flow)
app/admin/__tests__/                — Admin login, CV scores (pagination + detail), job listings form
```

```bash
npm test
```

### E2E (Playwright) — 6 test files

```
e2e/home.spec.ts    — landing page, navigation
e2e/api.spec.ts     — API response shapes, status codes, auth guards
e2e/cv-check.spec.ts — CV check page sections
e2e/auth-flow.spec.ts — login, signup, admin login, redirects
e2e/pages.spec.ts   — protected page redirects
e2e/admin-cv-scores.spec.ts — admin API auth guards
```

```bash
npm run test:e2e
```

## CI/CD

GitHub Actions (`.github/workflows/test.yml`):

```
push / PR → lint → test → e2e → deploy (main only, Vercel)
```

## Project Structure

```
├── app/
│   ├── admin/                  # admin dashboard (login, job listings, admins)
│   │   ├── (auth)/             #   login page
│   │   └── (dashboard)/        #   dashboard, job listings CRUD, admins CRUD
│   ├── api/
│   │   ├── admin/
│   │   │   ├── actions/         #   admin actions (ingest, match, digest, etc.)
│   │   │   ├── admins/         #   [id] CRUD
│   │   │   ├── audit/          #   audit log viewer
│   │   │   ├── cv-scores/      #   CV score listings + detail
│   │   │   ├── emails/         #   email log viewer
│   │   │   ├── job-listings/   #   CRUD
│   │   │   ├── leads/          #   leads management
│   │   │   ├── courses/        #   CRUD + bulk import
│   │   │   │   ├── [id]/        #   GET/PATCH/DELETE
│   │   │   │   └── bulk/        #   POST bulk import
│   │   │   ├── users/          #   user management + ban/unban
│   │   │   ├── login/          #   auth
│   │   │   └── logout/         #   session clear
│   │   │   ├── courses/        #   CRUD + bulk import
│   │   │   │   ├── [id]/        #   GET/PATCH/DELETE
│   │   │   │   └── bulk/        #   POST bulk import
│   │   │   ├── job-applications/#  jobs with applications viewer
│   │   │   └── users/
│   │   │       └── stats/       #   user counts (total/active/banned)
│   │   ├── apply/              # job application (form + bulk)
│   │   ├── cv/                 # CV upload + delete (authenticated)
│   │   ├── jobs/               # job search
│   │   ├── leads/              # email lead capture (public)
│   │   ├── notifications/      # user notifications CRUD
│   │   ├── profile/            # user profile CRUD
│   │   ├── score/              # public CV scoring
│   │   └── titles/             # title listing
│   ├── api-docs/               # Scalar API docs page
│   ├── auth/                   # OAuth callback handler
│   ├── dashboard/              # user dashboard (matches + bulk apply)
│   ├── cv-check/               # authenticated CV scoring page
│   ├── profile/                # user profile page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── __tests__/
│   ├── NotificationCenter.tsx   # notification bell + dropdown
│   ├── NotificationBell.tsx     # bell icon with unread badge
│   ├── NotificationDropdown.tsx # notification list
│   ├── ApplyModal.tsx           # multi-step application form
│   └── TitleSelector.tsx        # searchable title dropdown
│   └── ui/
│       ├── index.ts             # UI component barrel export
│       └── Pagination.tsx       # reusable pagination component
├── lib/
│   ├── __tests__/
│   ├── audit.ts                 # audit log insertion helper
│   ├── auth.ts                  # HMAC session cookie auth
│   ├── cv-scorer.ts             # Gemini 2.5 Flash CV scoring
│   ├── extract-cv-text.ts       # PDF/DOCX text extraction
│   ├── email.ts                 # Resend HTML email templates + welcome email
│   ├── next-auth.ts             # NextAuth config (credentials + OAuth)
│   ├── rate-limit.ts            # Upstash rate limit helper
│   ├── score-email-template.ts  # CV score result email HTML
│   ├── seed-admin.ts            # bootstrap first admin
│   ├── setup.sql                # DB schema + RLS policies
│   ├── supabase.ts              # Supabase client
│   ├── user-profile.ts          # User profile helpers
│   └── validations.ts           # Zod schemas (20+ schemas)
├── add-data/                    # batch job listing data
├── middleware.ts                 # auth guard (admin routes + API + cv-check)
├── next.config.ts               # withNextOpenApi wrapper
├── next.openapi.json            # OpenAPI spec + generation config
└── vitest.config.ts
```

## Admin Panel

`/admin` — boots admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` on first access.

- **Dashboard** — overview + quick stats
- **Job Titles** — manage the title taxonomy
- **Job Listings** — create, edit, delete job listings
- **CV Scores** — view all scored CVs with detail modal
- **Users** — manage users, ban/unban with audit logging; view total/active/banned counts
- **Applications** — view all job applications with detail per job
- **Courses** — manage learning courses with role associations; bulk import
- **Emails** — email log viewer (type/status filters, detail modal)
- **Audit Log** — view all admin actions (timeline with filters)
- **Actions** — manual triggers: ingest jobs, run matching, send digests, re-score CVs, cleanup, data export
- **Admins** — manage admin accounts (cannot self-delete)
