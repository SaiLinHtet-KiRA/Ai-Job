"use client";

interface ModalFooterProps {
  step: number;
  loading: boolean;
  onCancel: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ModalFooter({ step, loading, onCancel, onNext, onBack }: ModalFooterProps) {
  return (
    <div className="shrink-0 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800 sm:px-8">
      <div className="flex gap-3">
        {step === 0 ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/25 active:scale-[0.98]"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Back
            </button>
            <button
              type="submit"
              form="apply-form"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
