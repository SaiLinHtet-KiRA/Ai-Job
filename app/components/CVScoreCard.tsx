import type { CVScore } from "./types-cv";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
  return "bg-rose-500/10 border-rose-500/20";
}

export default function CVScoreCard({ score }: { score: CVScore }) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl border ${scoreBg(score.score)}`}
        >
          <span className={`text-2xl font-bold ${scoreColor(score.score)}`}>
            {score.score}
          </span>
        </div>
        <div>
          <p className="font-semibold text-white">CV Score</p>
          <p className="mt-0.5 text-[13px] text-[#8898aa]">
            {score.summary ?? (score.score >= 80
              ? "Great CV! You're ready to apply."
              : score.score >= 60
                ? "Good CV. A few improvements could help."
                : "Your CV needs attention before applying.")}
          </p>
        </div>
      </div>

      {score.strengths && score.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-[12px] font-medium uppercase tracking-wider text-emerald-400">
            Strengths
          </p>
          <ul className="mt-2 space-y-1">
            {score.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#8898aa]">
                <span className="mt-0.5 text-emerald-400">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.weaknesses && score.weaknesses.length > 0 && (
        <div className="mt-3">
          <p className="text-[12px] font-medium uppercase tracking-wider text-amber-400">
            Areas to Improve
          </p>
          <ul className="mt-2 space-y-1">
            {score.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#8898aa]">
                <span className="mt-0.5 text-amber-400">&#9888;</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.keywords_missing && score.keywords_missing.length > 0 && (
        <div className="mt-3">
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#8898aa]">
            Missing Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.keywords_missing.map((k) => (
              <span
                key={k}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-[#8898aa]"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
