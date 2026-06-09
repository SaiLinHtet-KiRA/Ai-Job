# easy2apply — Product Direction

> **Last updated:** 2025-05-30
> **Status:** Draft — living document

---

## 1. North Star

**Help job seekers find realistic opportunities and close the gap to their dream roles.**

Upload your CV → see your score → discover jobs you match → get a learning roadmap → tailor your CV → apply with confidence.

---

## 2. Target User (Hypothesis)

| Attribute | Description |
|-----------|-------------|
| Who | English-speaking job seekers (global) |
| Pain | Applying blindly, no feedback on CV quality, unclear what skills to learn next |
| Behavior | Active job hunters who apply to 10-50 jobs/week on LinkedIn, Indeed, etc. |
| Trigger | "Why am I not getting interviews?" or "What should I learn to get X role?" |

*To be validated in Phase 1 via distribution channel experiments.*

---

## 3. Competitive Landscape

| Competitor | What they do | Our differentiation |
|-----------|--------------|---------------------|
| Resume Worded | CV scoring + optimization tips | We connect score → actual jobs → roadmap (full loop) |
| Jobscan | ATS keyword matching against a specific JD | We match broadly across real market data |
| Teal / Rezi | CV builder tools | We're not a builder first — we're a matching + growth platform |
| LinkedIn Easy Apply | One-click apply | We help you *prepare* before applying (score + tailor + learn) |
| Lazyapply / Sonara | Mass auto-apply bots | We focus on quality (right fit) over quantity |

**Our moat (over time):**
- Accumulated job market trend data (daily snapshots from TheirStack)
- Role → course mappings (curated, then affiliate)
- Personalized CV rewrites that are job-specific, not generic

---

## 4. Product Features (Full Vision)

### 4.1 CV Score (Free, no account)
- Upload PDF/Word → AI scores against ATS criteria
- Instant results: score, strengths, weaknesses, missing keywords
- **Purpose:** Hook. Gets users in the door.

### 4.2 Job Matching (Free, progressive gate)
- Based on CV content, show matching jobs from TheirStack data
- Free: see top 3 matches. Registered: see all + save favorites
- **Purpose:** Demonstrate real value. "Here's what you can get right now."

### 4.3 Course Roadmap (Registered users)
- Curated course list per role (admin-managed)
- "You're targeting Frontend Dev → here are the courses to get there"
- Later: affiliate links (Udemy, Coursera, etc.) for revenue
- **Purpose:** Retention. Users come back to track learning progress.

### 4.4 CV Drafting (Registered users)
- User clicks a specific job → AI rewrites their CV tailored for that role
- Fallback: generate from scratch if no CV uploaded (fresh grads)
- Later: guided editor with inline AI suggestions
- **Purpose:** High-value feature. Potential premium/pay-per-use.

### 4.5 Job Insights (Registered users)
- Market intelligence dashboard per role + location
- "Java developers in Japan: 30% of tech market, +2% MoM"
- Data: daily snapshots from TheirStack, aggregated over time
- **Purpose:** Retention + differentiation. Gets better with time.

---

## 5. User Model (Progressive Disclosure)

```
Anonymous user ──────────────────────────────────────── Registered user
     │                                                        │
     ├─ CV Score (free)                                       ├─ All free features
     ├─ Top 3 job matches (teaser)                            ├─ Unlimited job matches
     └─ Course list preview                                   ├─ CV Drafting (AI rewrite)
                                                              ├─ Job Insights dashboard
                                                              ├─ Save results / history
                                                              └─ Email notifications (new matches)
```

**Gate trigger:** User wants to save, access full results, draft CV, or view insights → soft prompt to register (email + password via Supabase Auth).

No hard walls on the initial experience. The value is shown first, then we ask for commitment.

---

## 6. Phase Roadmap

### Phase 1: Lead Gen (CV Score) — ~1 week
- **Build:** CV upload → AI score → results page → email gate
- **Homepage:** Redesign to reflect CV scoring as the entry point
- **Goal:** 50 CV uploads, 20 email signups
- **Validates:** Do people trust us enough to upload their CV?

### Phase 2: Matching + Courses — ~2-3 weeks
- **Build:** TheirStack integration, job matching logic, course catalog (admin CRUD)
- **Show:** "Based on your CV, here are jobs you match" + "Here's what to learn"
- **Goal:** 30% of scored users click on a matched job
- **Validates:** Do people want job matching from us, or just the free score?

### Phase 3: CV Drafting + Insights — ~3-4 weeks
- **Build:** AI CV rewriting per job, daily snapshot cron, insights dashboard
- **Gate:** Registered users only for these features
- **Goal:** 10% registered users use CV drafting, 5 min avg time on insights
- **Validates:** Will people register (and eventually pay) for these features?

### Phase 4: Monetization — TBD
- Premium tier (unlimited drafts, priority insights, early job alerts)
- Affiliate course revenue
- Employer-side features (optional, separate discovery)

---

## 7. Data Architecture (Overview)

### Existing tables (keep)
- `titles` — job title taxonomy
- `jobs` — job listings
- `applications` — user applications (adapt for Phase 2+)
- `admins` — admin users

### New tables needed

| Table | Phase | Purpose |
|-------|-------|---------|
| `leads` | 1 | Email captures from CV score tool |
| `cv_scores` | 1 | Score results (linked to lead after email) |
| `users` | 2 | Registered user accounts (Supabase Auth) |
| `job_matches` | 2 | Cached match results per user |
| `courses` | 2 | Course catalog (title, url, platform, duration) |
| `role_courses` | 2 | Many-to-many: role → courses (with sort_order) |
| `job_snapshots` | 3 | Daily job posting counts by role + location |
| `cv_drafts` | 3 | Saved AI-generated CV rewrites per user per job |

### External integrations
- **TheirStack API** — job posting data (crawl + match)
- **Gemini 2.5 Flash** — CV scoring, CV rewriting
- **Supabase Storage** — CV file storage (after email gate)
- **Resend** — transactional emails
- **Supabase Auth** — user accounts (Phase 2+)

---

## 8. Key Metrics by Phase

| Phase | Metric | Target | Signal |
|-------|--------|--------|--------|
| 1 | CV uploads | 50 | People trust the tool |
| 1 | Email signups | 20 | Score is compelling enough to engage |
| 2 | Match click-through | 30% | Matching is valued |
| 2 | Course page views | 50 | Roadmap resonates |
| 3 | CV drafts generated | 20 | High-value feature confirmed |
| 3 | Insight page return visits | 2+/user | Retention validated |

---

## 9. Open Questions

- [ ] Distribution: Where do we promote Phase 1? (Myanmar communities? Reddit? LinkedIn?)
- [ ] Pricing: What's the free vs paid split? When do we test willingness to pay?
- [ ] TheirStack limits: What's the API rate limit / cost? How much data can we store?
- [ ] Localization: English only or Myanmar language support?
- [ ] Mobile: PWA? Native app later? Or responsive web only?

---

## 10. Principles

1. **Show value before asking for anything** — Score is free, no signup, no credit card
2. **Small and real > big and theoretical** — Ship something people can use this week
3. **Data compounds** — Every day of job snapshots makes insights more valuable
4. **Bridge, don't pivot** — Each phase must connect to the next. No orphan features.
5. **Validate demand, not capability** — We can build anything. The question is: will they use it?
