import MatchCard from "./MatchCard";
import type { Match } from "./types";

export default function MatchCardList({
  matches,
  selectedIds,
  expandedId,
  actingId,
  onSelect,
  onExpand,
  onSkip,
}: {
  matches: Match[];
  selectedIds: Set<number>;
  expandedId: number | null;
  actingId: number | null;
  onSelect: (id: number) => void;
  onExpand: (id: number | null) => void;
  onSkip: (id: number, action: string) => void;
}) {
  if (matches.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-[14px] text-[#8898aa]">
          No pending matches. Check back tomorrow for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          selected={selectedIds.has(match.id)}
          expanded={expandedId === match.id}
          acting={actingId === match.id}
          onSelect={onSelect}
          onExpand={onExpand}
          onSkip={onSkip}
        />
      ))}
    </div>
  );
}
