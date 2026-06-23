"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SkillAndDashboardSection() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="border-t border-white/5 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 md:grid-cols-2">
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

            <div className="mt-10">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
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
            </div>
          </div>

          <div className="space-y-8">
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
              <Link
                href={isAuthenticated ? "/roadmap" : "/login"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-[14px] font-medium text-purple-300 transition-all hover:bg-purple-500/20"
              >
                View Your Roadmap
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div>
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
                  { href: isAuthenticated ? "/dashboard" : "/login", label: "Dashboard", desc: "Overview of matches and activity" },
                  { href: isAuthenticated ? "/jobs" : "/login", label: "Browse Jobs", desc: "All matched jobs with filters" },
                  { href: isAuthenticated ? "/applications" : "/login", label: "Applications", desc: "Track status of every application" },
                  { href: isAuthenticated ? "/profile" : "/login", label: "Profile & CV", desc: "Manage your CV and preferences" },
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
      </div>
    </section>
  );
}
