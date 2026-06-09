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
- **Email notifications** — Beautiful HTML emails to applicants (applied jobs summary) and employers (candidate details + CV link)
- **Study roadmap** — Personalized learning path with curated courses and time estimates
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

14 endpoints across 12 route handlers. All inputs validated with shared Zod schemas (`lib/validations.ts`).

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

### Unit (Vitest)

```
lib/__tests__/validations.test.ts   — 50 tests for Zod schemas
lib/__tests__/auth.test.ts          — password hashing, session tokens
components/__tests__/               — ApplyModal rendering, validation
```

```bash
npm test
```

### E2E (Playwright)

```
e2e/home.spec.ts    — landing page, modal, validation
e2e/api.spec.ts     — API response shapes, status codes
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
│   │   │   ├── admins/         #   [id] CRUD
│   │   │   ├── cv-scores/      #   CV score listings + detail
│   │   │   ├── job-listings/   #   CRUD
│   │   │   ├── titles/         #   CRUD
│   │   │   ├── login/          #   auth
│   │   │   └── logout/         #   session clear
│   │   ├── apply/              # job application (form + bulk)
│   │   ├── cv/                 # CV upload + delete (authenticated)
│   │   ├── jobs/               # job search
│   │   ├── leads/              # email lead capture
│   │   ├── profile/            # user profile CRUD
│   │   ├── score/              # public CV scoring
│   │   └── titles/             # title listing
│   ├── api-docs/               # Scalar API docs page
│   ├── dashboard/               # user dashboard (matches + bulk apply)
│   ├── cv-check/               # public CV scoring page
│   ├── profile/                # user profile page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── __tests__/
│   ├── ApplyModal.tsx           # multi-step application form
│   └── TitleSelector.tsx        # searchable title dropdown
├── e2e/                         # Playwright tests
├── lib/
│   ├── __tests__/
│   ├── auth.ts                  # HMAC session cookie auth
│   ├── cv-scorer.ts             # Gemini 2.5 Flash CV scoring
│   ├── extract-cv-text.ts       # PDF/DOCX text extraction
│   ├── email.ts                 # Resend HTML email templates
│   ├── rate-limit.ts            # Upstash rate limit helper
│   ├── seed-admin.ts            # bootstrap first admin
│   ├── setup.sql                # DB schema + RLS policies
│   ├── supabase.ts              # Supabase client
│   ├── user-profile.ts          # User profile helpers
│   └── validations.ts           # Zod schemas
├── add-data/                    # batch job listing data
├── middleware.ts                 # auth guard (admin routes + API)
├── next.config.ts               # withNextOpenApi wrapper
├── next.openapi.json            # OpenAPI spec + generation config
└── vitest.config.ts
```

## Admin Panel

`/admin` — boots admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` on first access.

- **Dashboard** — overview + quick stats
- **Job Titles** — manage the title taxonomy
- **Job Listings** — create, edit, delete job listings
- **Admins** — manage admin accounts (cannot self-delete)
