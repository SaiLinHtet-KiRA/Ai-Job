import MatchCard from "./MatchCard";
import type { Match } from "./types";

export default function MatchCardList({
  matches,
  selectedIds,
  onSelect,
}: {
  matches: Match[];
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
}) {
  if (matches.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-[14px] text-[#8898aa]">
          No matches found. Upload your CV to get job recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard
          key={match.job_listings.id}
          match={match}
          selected={selectedIds.has(match.job_listings.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
