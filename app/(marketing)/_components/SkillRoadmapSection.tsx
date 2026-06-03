import Link from "next/link";

export default function SkillRoadmapSection() {
  return (
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
  );
}
