export default function BulkActionBar({
  selectedCount,
  total,
  onToggleAll,
  onReview,
}: {
  selectedCount: number;
  total: number;
  onToggleAll: () => void;
  onReview: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedCount === total && total > 0}
            onChange={onToggleAll}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
          />
          <span className="text-[12px] text-[#8898aa]">
            {selectedCount} of {total} selected
          </span>
        </label>
      </div>
      <button
        onClick={onReview}
        disabled={selectedCount === 0}
        className="rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Review & Apply ({selectedCount})
      </button>
    </div>
  );
}
