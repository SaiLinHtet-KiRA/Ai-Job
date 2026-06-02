import Link from "next/link";
import TopNav from "../components/TopNav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-[900px] w-[900px] rounded-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[700px] w-[700px] rounded-full bg-gradient-to-tr from-blue-500/10 via-primary/10 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI-Powered Job Search Platform
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Land your next job
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              10x faster with AI
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#8898aa]">
            Upload your CV once. Our AI scores it, finds your best-fit jobs, generates tailored cover letters, and lets you bulk apply — all in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="w-full rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/cv-check"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-white transition-all hover:bg-white/[0.07] sm:w-auto"
            >
              Check CV Score — Free
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
            <div>
              <div className="text-3xl font-bold text-white">10k+</div>
              <div className="mt-1 text-[13px] text-[#8898aa]">Jobs Matched</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="mt-1 text-[13px] text-[#8898aa]">Interview Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">3min</div>
              <div className="mt-1 text-[13px] text-[#8898aa]">To Apply</div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tool: CV Score */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-10 lg:p-14">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[12px] font-medium text-emerald-400">
                  Free Tool — No Login Required
                </div>
                <h2 className="text-2xl font-bold text-white lg:text-3xl">
                  How strong is your CV?
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[#8898aa]">
                  Paste any job description and upload your CV. Our AI gives you an ATS compatibility score, highlights gaps, and tells you exactly what to improve.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "ATS compatibility score out of 100",
                    "Keyword gap analysis vs. job description",
                    "Specific suggestions to improve your CV",
                    "Works with PDF, Word, and text CVs",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] text-[#8898aa]">
                      <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cv-check"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-[#0a2540] transition-all hover:bg-white/90"
                >
                  Check Your CV Score
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <div className="hidden items-center justify-center bg-white/[0.02] p-10 md:flex">
                <div className="w-full max-w-xs rounded-xl border border-white/10 bg-[#0a2540] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#8898aa]">CV Score</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Strong</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold text-white">87</span>
                    <span className="mb-2 text-[#8898aa]">/ 100</span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-primary to-emerald-400" />
                  </div>
                  <div className="mt-5 space-y-2">
                    {[
                      { label: "Keywords", score: 92 },
                      { label: "Format", score: 88 },
                      { label: "Experience", score: 81 },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-[12px]">
                        <span className="text-[#8898aa]">{s.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-primary/60" style={{ width: `${s.score}%` }} />
                          </div>
                          <span className="text-white">{s.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Your full job search, in one place</h2>
            <p className="mt-4 text-[16px] text-[#8898aa]">From CV to offer — every step covered</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Upload CV",
                description: "Upload your CV to your profile. AI extracts your skills, experience, and preferences automatically.",
                href: "/login",
                cta: "Go to Profile",
                color: "from-primary/20 to-primary/5",
                border: "border-primary/20",
                icon: (
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Browse Jobs",
                description: "AI matches your profile with thousands of jobs. Filter by role, salary, and location.",
                href: "/login",
                cta: "Browse Jobs",
                color: "from-blue-500/20 to-blue-500/5",
                border: "border-blue-500/20",
                icon: (
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Smart Apply",
                description: "Select jobs and apply in bulk. AI writes a tailored cover letter for each application.",
                href: "/login",
                cta: "Start Applying",
                color: "from-emerald-500/20 to-emerald-500/5",
                border: "border-emerald-500/20",
                icon: (
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Track Progress",
                description: "See every application's status in one dashboard. Know exactly where you stand.",
                href: "/login",
                cta: "View Tracker",
                color: "from-purple-500/20 to-purple-500/5",
                border: "border-purple-500/20",
                icon: (
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-6 transition-all hover:scale-[1.02]`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-white/20">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8898aa]">{item.description}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
                >
                  {item.cta}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Roadmap Feature */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[12px] font-medium text-purple-400">
                Skill Development
              </div>
              <h2 className="text-2xl font-bold text-white lg:text-3xl">
                Know exactly what skills to learn next
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#8898aa]">
                Our AI compares your CV against the roles you want and builds a personalised learning roadmap — so you know precisely what to improve to get hired.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Gap analysis between your skills and job requirements",
                  "Prioritised learning roadmap by impact",
                  "Course and resource recommendations",
                  "Track skill progress over time",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-[#8898aa]">
                    <svg className="h-4 w-4 shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-[14px] font-medium text-purple-300 transition-all hover:bg-purple-500/20"
              >
                View Your Roadmap
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-[14px] font-semibold text-white">Your Skill Roadmap</h4>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-400">4 gaps found</span>
              </div>
              <div className="space-y-3">
                {[
                  { skill: "TypeScript", priority: "High", progress: 20, color: "bg-rose-400" },
                  { skill: "System Design", priority: "High", progress: 10, color: "bg-rose-400" },
                  { skill: "AWS Basics", priority: "Medium", progress: 45, color: "bg-amber-400" },
                  { skill: "GraphQL", priority: "Low", progress: 60, color: "bg-emerald-400" },
                ].map((item) => (
                  <div key={item.skill} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">{item.skill}</span>
                      <span className={`text-[11px] font-medium ${item.priority === "High" ? "text-rose-400" : item.priority === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${item.color} opacity-70`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 text-[13px] font-medium text-[#8898aa]">Your Dashboard</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "New Matches", value: "3", sub: "+2 today", color: "text-emerald-400" },
                  { label: "Applications", value: "12", sub: "This month", color: "text-[#8898aa]" },
                  { label: "Response Rate", value: "25%", sub: "Above avg", color: "text-emerald-400" },
                  { label: "Profile Score", value: "85", sub: "Out of 100", color: "text-[#8898aa]" },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-white/10 bg-[#0a2540] p-4">
                    <p className="text-[11px] font-medium uppercase text-[#8898aa]">{card.label}</p>
                    <p className="mt-1.5 text-2xl font-bold text-white">{card.value}</p>
                    <p className={`mt-0.5 text-[11px] ${card.color}`}>{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["Senior Frontend Dev — Stripe", "Product Designer — Figma", "Full Stack Eng — Vercel"].map((job) => (
                  <div key={job} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                    <span className="text-[13px] text-white">{job}</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-primary">Match</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[12px] font-medium text-blue-400">
                Smart Dashboard
              </div>
              <h2 className="text-2xl font-bold text-white lg:text-3xl">
                Your entire job search, one screen
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#8898aa]">
                See your top AI-matched jobs, track every application, monitor your response rate, and take action — all from a single clean dashboard.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { href: "/login", label: "Dashboard", desc: "Overview of matches and activity" },
                  { href: "/login", label: "Browse Jobs", desc: "All matched jobs with filters" },
                  { href: "/login", label: "Applications", desc: "Track status of every application" },
                  { href: "/login", label: "Profile & CV", desc: "Manage your CV and preferences" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
                  >
                    <div>
                      <span className="text-[14px] font-medium text-white">{link.label}</span>
                      <p className="text-[12px] text-[#8898aa]">{link.desc}</p>
                    </div>
                    <svg className="h-4 w-4 text-[#8898aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5 px-6 py-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-purple-500/5 to-blue-500/8" />
          <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find your next job?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-[#8898aa]">
            Start with a free CV score — no account needed. When you&apos;re ready, sign up and get matched with your perfect role.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="w-full rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
            >
              Create Free Account
            </Link>
            <Link
              href="/cv-check"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-white transition-all hover:bg-white/[0.07] sm:w-auto"
            >
              Check CV Score First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary" />
                <span className="font-semibold text-white">easy2apply</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#8898aa]">
                AI-powered job search for modern job seekers.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Tools</p>
              <ul className="space-y-2">
                <li><Link href="/cv-check" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">CV Score Checker</Link></li>
                <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Job Matching</Link></li>
                <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Bulk Apply</Link></li>
                <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Skill Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Account</p>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Sign In</Link></li>
                <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Create Account</Link></li>
                <li><Link href="/dashboard" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Dashboard</Link></li>
                <li><Link href="/profile" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Your Profile</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">App</p>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Browse Jobs</Link></li>
                <li><Link href="/applications" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">My Applications</Link></li>
                <li><Link href="/roadmap" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Skill Roadmap</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-8 text-center">
            <p className="text-[13px] text-[#8898aa]">© 2026 easy2apply. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
