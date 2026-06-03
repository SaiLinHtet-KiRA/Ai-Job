import Link from "next/link";

export default function DashboardPreviewSection() {
  return (
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
  );
}
