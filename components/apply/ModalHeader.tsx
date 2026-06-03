"use client";

interface ModalHeaderProps {
  step: number;
  totalSteps: number;
  progress: number;
  onClose: () => void;
}

export default function ModalHeader({ step, totalSteps, progress, onClose }: ModalHeaderProps) {
  return (
    <div className="relative shrink-0 bg-gradient-to-r from-primary via-primary-dark to-[#004DD4] px-6 pb-6 pt-6 sm:px-8 sm:pt-7">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:right-6 sm:top-5"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-xl font-bold text-white sm:text-2xl">Apply for a Job</h2>
      <p className="mt-1 text-sm text-white/70">
        Step {step + 1} of {totalSteps} &mdash;{" "}
        {step === 0 ? "Your details" : "Preferences & resume"}
      </p>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
