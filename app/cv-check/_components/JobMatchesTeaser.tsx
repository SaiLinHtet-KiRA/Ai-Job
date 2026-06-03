import Link from "next/link";
import { MatchedJob } from "./types";

type JobMatchesTeaserProps = {
  matchedJobs: MatchedJob[];
  matchLoading: boolean;
};

export default function JobMatchesTeaser({ matchedJobs, matchLoading }: JobMatchesTeaserProps) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-primary">Jobs that match your CV</p>
        {matchedJobs.length > 0 && (
          <Link href="/login" className="text-[12px] font-medium text-primary hover:text-primary-dark">
            See all →
          </Link>
        )}
      </div>

      {matchLoading && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
          <span className="text-[12px] text-[#8898aa]">Finding matches...</span>
        </div>
      )}

      {!matchLoading && matchedJobs.length > 0 && (
        <div className="mt-4 space-y-3">
          {matchedJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-white">{job.title}</p>
                <p className="mt-0.5 text-[12px] text-[#8898aa]">{job.company} &middot; {job.location}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.match_score >= 70 ? "bg-emerald-500/10 text-emerald-400" : job.match_score >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                {job.match_score}%
              </span>
            </div>
          ))}
        </div>
      )}

      {!matchLoading && matchedJobs.length === 0 && (
        <p className="mt-3 text-[13px] text-[#8898aa]">No matches found yet.</p>
      )}

      <p className="mt-4 text-[11px] text-[#8898aa]/50">
        Create a free account to see all matches and get notified of new ones.
      </p>
    </div>
  );
}
