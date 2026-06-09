# easy2apply

> Score your CV. Match to real jobs. Close the gap.

---

## Vision

A platform that shows job seekers **where they stand**, **what they can get**, and **how to get what they want**.

```
Upload CV → Score → Match Jobs → Learn Skills → Tailor CV → Apply
```

---

## The Problem

| What job seekers do today | What's broken |
|---------------------------|---------------|
| Apply to 50+ jobs blindly | No feedback on why they're rejected |
| Guess which skills to learn | No connection between skill gaps and real demand |
| Use the same CV everywhere | CVs aren't tailored to specific roles |

---

## Product (5 Features)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ① CV Score        Free. No account. Instant ATS feedback.    │
│                                                                 │
│   ② Job Matching    "Here are jobs you qualify for right now."  │
│                                                                 │
│   ③ Course Roadmap  "Here's what to learn to level up."        │
│                                                                 │
│   ④ CV Drafting     AI tailors your CV for a specific job.     │
│                                                                 │
│   ⑤ Job Insights    Market trends by role and location.        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Model

```
FREE (no account)              REGISTERED (email + password)
─────────────────              ─────────────────────────────
• CV Score                     • Everything free, plus:
• Top 3 job matches            • Unlimited matches
• Course preview               • CV Drafting
                               • Job Insights
                               • Saved history
                               • Email alerts
```

**Principle:** Show value first. Ask for commitment after.

---

## User Journey

```
STRANGER → ANONYMOUS → SCORED → LEAD → REGISTERED → ACTIVE
              │            │        │         │           │
           visits       uploads   gives    creates    returns
            site          CV      email    account    weekly
```

| Stage | User thinks | We deliver |
|-------|-------------|------------|
| **Awareness** | "Is this legit?" | Clean UI, clear promise, no clutter |
| **First use** | "Is it safe to upload?" | Privacy note: "Never stored without permission" |
| **Value** | "This is actually useful" | Specific score + real job matches |
| **Commit** | "Worth saving" | Soft gate — email unlocks full report |
| **Retain** | "Helps me track progress" | New insights, job alerts, draft history |

---

## Phase Roadmap

| Phase | Ship | Validate | Timeline |
|-------|------|----------|----------|
| **1** | CV Score + new homepage | Do people trust us? (50 uploads, 20 emails) | ~1 week |
| **2** | Job matching + courses | Do they want matching? (30% click-through) | ~2-3 weeks |
| **3** | CV drafting + insights | Will they register? (10% use drafting) | ~3-4 weeks |
| **4** | Monetization | Will they pay? | TBD |

Each phase **validates** the next. Don't advance without signal.

---

## Phase 1 Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  LANDING PAGE  │────▶│   ANALYZING    │────▶│    RESULTS     │
│                │     │                │     │                │
│  Upload CV     │     │  "Analyzing    │     │  Score: 74/100 │
│  (PDF / Word)  │     │   your CV..."  │     │  Strengths (3) │
│                │     │   5-10 sec     │     │  Weaknesses(3) │
│  No signup.    │     │                │     │  Keywords      │
│  Free.         │     │                │     │                │
└────────────────┘     └────────────────┘     │  ── gate ──   │
                                              │  [Email] →     │
                                              │  Full report   │
                                              └────────────────┘
```

**Rules:**
- CV never stored until user gives email
- Rate limit: 3/hour/IP
- Errors are friendly, never crashes

---

## Competitive Edge

| Them | Us |
|------|----|
| Resume Worded — scores your CV | We score → match → teach → tailor (full loop) |
| Jobscan — match against one JD | We match across the whole market |
| LinkedIn — apply and hope | We help you prepare before applying |

**Moat:** Market data compounds daily. Course mappings grow. CV rewrites are job-specific.

---

## Data Architecture

```
Phase 1:  leads, cv_scores
Phase 2:  users, job_matches, courses, role_courses
Phase 3:  job_snapshots, cv_drafts
```

**Integrations:** TheirStack (jobs) · Gemini 2.5 Flash (AI) · Supabase (DB + auth + storage) · Resend (email)

---

## Principles

1. **Value before gate** — never hide the score behind a wall
2. **Ship small, validate fast** — one feature, one metric, one week
3. **Data compounds** — every day of snapshots = stronger insights
4. **Bridge, don't orphan** — each phase connects to the next
5. **Specific > generic** — "Add React to your skills section" beats "improve your CV"

---

## Open Questions

- Distribution channels for Phase 1 launch
- Free vs. paid boundary (when to test pricing)
- TheirStack API limits and cost
- English only or multi-language
- Responsive web only or PWA later

---

*v1.0 — 2025-05-30*
