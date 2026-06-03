"use client";

import type { Match } from "./types";

export default function MatchCard({
  match,
  selected,
  expanded,
  acting,
  onSelect,
  onExpand,
  onSkip,
}: {
  match: Match;
  selected: boolean;
  expanded: boolean;
  acting: boolean;
  onSelect: (id: number) => void;
  onExpand: (id: number | null) => void;
  onSkip: (id: number, action: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/15">
      <div className="flex items-center gap-4 p-5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(match.id)}
          className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] font-medium text-white">
              {match.job_listings.title}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${match.match_score >= 70 ? "bg-emerald-500/10 text-emerald-400" : match.match_score >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
              {match.match_score}% match
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#8898aa]">
            {match.job_listings.company} &middot; {match.job_listings.location}
            {match.job_listings.apply_email ? (
              <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                Email apply
              </span>
            ) : (
              <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                Manual apply
              </span>
            )}
          </p>
          {match.missing_skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.missing_skills.map((skill) => (
                <span key={skill} className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-400">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExpand(expanded ? null : match.id)}
            className="rounded-lg border border-white/10 px-3 py-2 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
          >
            {expanded ? "Hide" : "Preview"}
          </button>
          <button
            onClick={() => onSkip(match.id, "skipped")}
            disabled={acting}
            className="rounded-lg border border-white/10 px-3 py-2 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8898aa]">
            Generated cover letter
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-white/[0.02] p-4 text-[13px] leading-relaxed text-white/70">
            {match.cover_letter}
          </pre>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-[11px] text-[#8898aa]/50">
              {match.job_listings.apply_email
                ? `Will be sent to ${match.job_listings.apply_email}`
                : `You'll apply via ${match.job_listings.apply_url}`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
