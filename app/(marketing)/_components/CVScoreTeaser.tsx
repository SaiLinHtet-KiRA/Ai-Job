import Link from "next/link";

export default function CVScoreTeaser() {
  return (
    <section className="border-t border-white/5 px-6 py-14">
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
  );
}
