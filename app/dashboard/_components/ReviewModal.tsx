import type { Match } from "./types";

export default function ReviewModal({
  open,
  selectedMatches,
  applying,
  applyResult,
  onClose,
  onApply,
}: {
  open: boolean;
  selectedMatches: Match[];
  applying: boolean;
  applyResult: { success: number; failed: number } | null;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!open) return null;

  const canBulkApply = selectedMatches.every((m) => m.job_listings.apply_email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a2540] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Review Applications</h3>
            <p className="text-[13px] text-[#8898aa]">{selectedMatches.length} jobs selected</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#8898aa] hover:bg-white/10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {!canBulkApply && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-400">
              Some selected jobs require manual application (no email provided). Only email-apply jobs will be processed.
            </div>
          )}

          {applyResult ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-emerald-400">
                {applyResult.success} application{applyResult.success !== 1 ? 's' : ''} sent!
              </p>
              {applyResult.failed > 0 && (
                <p className="mt-1 text-[13px] text-amber-400">{applyResult.failed} failed</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedMatches.map((match) => (
                <div key={match.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{match.job_listings.title}</h4>
                      <p className="text-[13px] text-[#8898aa]">{match.job_listings.company}</p>
                    </div>
                    {match.job_listings.apply_email ? (
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">
                        {match.job_listings.apply_email}
                      </span>
                    ) : (
                      <span className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
                        Manual apply
                      </span>
                    )}
                  </div>
                  <div className="mt-3 rounded-lg bg-white/[0.02] p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#8898aa]">Cover Letter</p>
                    <p className="mt-1 line-clamp-3 text-[12px] text-white/70">{match.cover_letter}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!applyResult && (
          <div className="border-t border-white/10 px-6 py-4">
            <button
              onClick={onApply}
              disabled={applying || selectedMatches.length === 0}
              className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {applying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending applications...
                </span>
              ) : (
                `Send ${selectedMatches.length} Application${selectedMatches.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
