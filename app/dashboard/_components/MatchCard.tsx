"use client";

import type { Match } from "./types";

export default function MatchCard({
  match,
  selected,
  onSelect,
}: {
  match: Match;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const job = match.job_listings;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/15">
      <div className="flex items-center gap-4 p-5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(job.id)}
          className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] font-medium text-white">{job.title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                match.match_score >= 70
                  ? "bg-emerald-500/10 text-emerald-400"
                  : match.match_score >= 50
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {match.match_score}% match
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#8898aa]">
            {job.company} &middot; {job.location}
            {job.apply_email ? (
              <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                Email apply
              </span>
            ) : (
              <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                Manual apply
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
