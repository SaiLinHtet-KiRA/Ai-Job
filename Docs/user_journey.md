# easy2apply — User Journey & Flows

> **Last updated:** 2025-05-30
> **Depends on:** product_direction.md

---

## 1. User Journey Map

### The lifecycle of a user from stranger → power user

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE        │ AWARENESS    │ FIRST USE     │ VALUE        │ COMMIT       │ RETAIN        │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Action       │ Sees post/ad │ Uploads CV    │ Gets score + │ Gives email  │ Checks        │
│              │ about free   │ on landing    │ sees matched │ or registers │ insights,     │
│              │ CV scoring   │ page          │ jobs         │ account      │ drafts CVs    │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Thinking     │ "Is this     │ "Is it safe?" │ "This is     │ "Worth       │ "This helps   │
│              │ legit?"      │ "Will it work │ actually     │ saving."     │ me track my   │
│              │              │ on my CV?"    │ useful."     │              │ progress."    │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Emotion      │ Curious but  │ Slightly      │ Surprised /  │ Willing      │ Empowered     │
│              │ skeptical    │ anxious       │ impressed    │              │               │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Touchpoint   │ Reddit post, │ Landing page  │ Results page │ Email gate / │ Dashboard,    │
│              │ LinkedIn,    │ (upload UI)   │ (score +     │ signup modal │ insights,     │
│              │ community    │               │ matches)     │              │ email alerts  │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Drop-off     │ "Looks like  │ "I don't      │ "Score is    │ "I don't     │ "Nothing new  │
│ risk         │ spam"        │ trust this    │ too generic" │ want another │ to see"       │
│              │              │ with my CV"   │              │ account"     │               │
├──────────────┼──────────────┼───────────────┼──────────────┼──────────────┼───────────────┤
│ Mitigation   │ Clean UI,    │ Privacy note, │ Specific     │ Progressive  │ Weekly email, │
│              │ social proof │ "never stored │ feedback,    │ disclosure,  │ new insights, │
│              │ (if any)     │ without       │ real job     │ clear value  │ job alerts    │
│              │              │ permission"   │ matches      │ for signup   │               │
└──────────────┴──────────────┴───────────────┴──────────────┴──────────────┴───────────────┘
```

### Key Transitions

| From → To | Trigger | What must be true |
|-----------|---------|-------------------|
| Awareness → First Use | Clicks link from community post | Landing page loads fast, looks trustworthy |
| First Use → Value | Uploads CV, sees results | Score feels accurate, feedback is specific (not generic) |
| Value → Commit | Wants full report / save results | The gated content is clearly better than what they already see |
| Commit → Retain | Returns to check insights / draft CV | New data exists since last visit, notifications remind them |

---

## 2. User Flows

### 2.1 Phase 1: CV Score Flow (Anonymous)

```
[Landing Page]
     │
     ▼
┌──────────────┐    No file?     ┌──────────────────┐
│ Upload CV    │───────────────→ │ Error: "Please   │
│ (PDF/Word)   │                 │ upload a PDF or  │
└──────┬───────┘                 │ Word file"       │
       │                         └──────────────────┘
       │ File > 5MB?
       │────────────────────────→ [Error: "File too large (max 5MB)"]
       │
       │ Valid file
       ▼
┌──────────────┐
│ Loading...   │ ("Analyzing your CV...")
│ ~5-10 sec    │
└──────┬───────┘
       │
       │ AI fails / timeout?
       │────────────────────────→ [Error: "Couldn't analyze. Try again or upload a different format."]
       │
       │ Success
       ▼
┌──────────────────────────────┐
│ RESULTS PAGE                 │
│                              │
│ ┌──────────────────────────┐ │
│ │ Score: 74/100            │ │
│ │ ✓ Strengths (3)         │ │
│ │ ✗ Weaknesses (3)        │ │
│ │ Summary (2 sentences)   │ │
│ └──────────────────────────┘ │
│                              │
│ ─── SOFT GATE BELOW ───     │
│                              │
│ "Get your full keyword       │
│  report + save this result"  │
│                              │
│ [Email input] [Send report]  │
│                              │
│ (small) "We never share your │
│ CV without your approval."   │
└──────────────┬───────────────┘
               │
               │ User enters email?
               ▼
┌──────────────────────────────┐
│ SAVE & EMAIL                 │
│ 1. Store CV in Supabase      │
│ 2. Insert lead row           │
│ 3. Send confirmation email   │
│ 4. Show: "Check your inbox!" │
└──────────────────────────────┘
```

### 2.2 Phase 2: Job Matching Flow (After Score)

```
[Results Page (after scoring)]
     │
     │ Below score + soft gate:
     ▼
┌──────────────────────────────┐
│ "Jobs that match your CV"    │
│                              │
│ ┌────────────────────────┐   │
│ │ 1. Frontend Dev @ Acme │   │   ← top 3 shown free
│ │ 2. React Dev @ StartCo │   │
│ │ 3. UI Engineer @ BigCo │   │
│ └────────────────────────┘   │
│                              │
│ "See all 12 matches →"       │   ← registration gate
│ (requires account)           │
└──────────────┬───────────────┘
               │
               │ User clicks a job?
               ▼
┌──────────────────────────────┐
│ JOB DETAIL                   │
│                              │
│ Title, company, location     │
│ Required skills              │
│ Your match: 78%              │
│ Skills you're missing: [x,y] │
│                              │
│ [Tailor my CV for this role] │  ← Phase 3 (CV Drafting)
│ [View courses to close gaps] │  ← Phase 2 (Roadmap)
└──────────────────────────────┘
```

### 2.3 Phase 2: Course Roadmap Flow

```
[Job Detail → "View courses"]
     │
     ▼
┌──────────────────────────────────┐
│ ROADMAP: Frontend Developer      │
│                                  │
│ Your gaps: React, TypeScript     │
│                                  │
│ Recommended courses:             │
│ ┌──────────────────────────────┐ │
│ │ 1. React - The Complete Guide│ │
│ │    Udemy · 40hrs · Beginner  │ │
│ │ 2. TypeScript Deep Dive      │ │
│ │    Frontend Masters · 8hrs   │ │
│ │ 3. Testing with Playwright   │ │
│ │    YouTube · 3hrs · Free     │ │
│ └──────────────────────────────┘ │
│                                  │
│ (Registered users only)          │
└──────────────────────────────────┘
```

### 2.4 Phase 3: CV Drafting Flow

```
[Job Detail → "Tailor my CV"]
     │
     │ Not registered? → [Signup prompt]
     │ No CV on file?  → [Upload CV first]
     │
     │ Has CV + registered
     ▼
┌──────────────────────────────┐
│ DRAFTING                     │
│                              │
│ "Tailoring your CV for       │
│  Frontend Dev @ Acme..."     │
│                              │
│ ~10-15 sec (AI rewrite)      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ DRAFT RESULT                 │
│                              │
│ [Side-by-side diff view]     │
│ Left: Original CV sections   │
│ Right: Rewritten for role    │
│                              │
│ Changes highlighted:         │
│ • Added keywords: React, TS  │
│ • Reworded 3 bullet points   │
│ • Added professional summary │
│                              │
│ [Download PDF] [Edit more]   │
│ [Apply to this job →]        │
└──────────────────────────────┘
```

### 2.5 Phase 3: Job Insights Flow

```
[Dashboard → Insights tab]
     │
     │ Not registered? → [Signup prompt]
     │
     ▼
┌──────────────────────────────────────┐
│ JOB INSIGHTS                         │
│                                      │
│ Your role: Frontend Developer        │
│ Location: Japan (or global)          │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Market share: 30% of tech jobs   │ │
│ │ Trend: ↑ 2% vs last month       │ │
│ │ Avg salary: $85,000/yr           │ │
│ │ Top required skills: React (78%),│ │
│ │   TypeScript (65%), Next.js (42%)│ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Chart: postings over last 6 months] │
│                                      │
│ Compare with: [Select another role ▼]│
└──────────────────────────────────────┘
```

### 2.6 Error & Edge Case Flows

| Scenario | User sees | Recovery path |
|----------|-----------|---------------|
| Unsupported file type | "Please upload a PDF or Word document" | Re-upload button |
| File > 5MB | "Your file is too large (max 5MB). Try compressing it." | Re-upload |
| AI timeout (>15s) | "Analysis is taking longer than expected..." | Auto-retry once, then show "Try again" button |
| AI returns garbage JSON | "We couldn't read your CV clearly. Try a different file format." | Re-upload |
| Rate limited (3/hr) | "You've used your free analyses for this hour. Come back in [time]." | Countdown timer |
| Empty/corrupted PDF | "Your file appears to be empty or unreadable." | Re-upload |
| Email already exists (lead) | Silently update the existing row, send a fresh report | No error shown |
| Network error during upload | "Connection lost. Please check your internet and try again." | Retry button |

---

## 3. Returning User Flows

### 3.1 Returning Anonymous User (has email in leads table)
```
Lands on homepage → Uploads new CV → Gets new score
(No memory of previous visit — anonymous by design)
```

### 3.2 Returning Registered User
```
Lands on homepage → "Welcome back" state (logged in)
     │
     ├─→ Dashboard: previous scores, saved matches, draft history
     ├─→ "Score a new CV" (upload another)
     ├─→ Check insights (updated since last visit)
     └─→ Resume a draft
```

---

## 4. Signup / Registration Flow

```
[Any gated feature clicked]
     │
     ▼
┌──────────────────────────────┐
│ SIGNUP MODAL                 │
│                              │
│ "Create a free account to    │
│  save your results and       │
│  access all features."       │
│                              │
│ [Email]                      │
│ [Password]                   │
│ [Sign up]                    │
│                              │
│ "Already have an account?    │
│  Log in"                     │
│                              │
│ (Supabase Auth handles this) │
└──────────────────────────────┘
```

**Progressive disclosure principle:** The user always sees the *shape* of what they'll get before being asked to sign up. Never a blind gate.

---

## 5. Homepage Direction (Phase 1)

The homepage should communicate ONE thing clearly:

> "Upload your CV → get an instant ATS score → free, no signup."

### Above the fold:
- Headline: communicates the value (ATS scoring)
- One upload button (primary CTA)
- Trust signal: "Analyzed in memory. Never stored without permission."

### Below the fold (optional):
- How it works (3 steps)
- What you'll get (score, strengths, weaknesses, keywords)
- Preview of future features (job matching, roadmap) — builds anticipation

### What's NOT on the Phase 1 homepage:
- Job listings (remove or hide existing ones)
- "Apply Now" button (that's the old product direction)
- Navigation to features that don't exist yet

---

## 6. State Diagram: User Lifecycle

```
                    ┌───────────┐
                    │ STRANGER  │
                    └─────┬─────┘
                          │ visits site
                          ▼
                    ┌───────────┐
              ┌─────│ ANONYMOUS │─────┐
              │     └─────┬─────┘     │
              │           │           │
         uploads CV    bounces    returns later
              │           │        (no memory)
              ▼           ▼
        ┌───────────┐   [gone]
        │  SCORED   │
        └─────┬─────┘
              │
         gives email
              │
              ▼
        ┌───────────┐
        │   LEAD    │ (email in DB, gets report)
        └─────┬─────┘
              │
         registers account
              │
              ▼
        ┌───────────┐
        │ REGISTERED│ (full access)
        └─────┬─────┘
              │
         uses premium features
              │
              ▼
        ┌───────────┐
        │   ACTIVE  │ (retained, returning)
        └───────────┘
```

---

## 7. Next Steps

- [ ] Review this document — does anything feel wrong?
- [ ] Decide: build Phase 1 homepage first, or API first?
- [ ] Set up TheirStack API access (needed for Phase 2 planning)
- [ ] Draft community post copy for Phase 1 launch
