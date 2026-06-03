"use client";

import { useState } from "react";

type EmailModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: (email: string) => void;
};

export default function EmailModal({ open, onClose, onContinue }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleContinue = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    onContinue(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-60" style={{ animation: "gradient-shift 4s ease infinite" }} />
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-80" style={{ animation: "gradient-shift 4s ease infinite" }} />

        <div className="relative rounded-2xl bg-[#0f2d4d] p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-[18px] font-semibold text-white">
            We will send the score result to your email
          </h2>

          <div className="mt-5">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 text-[14px] text-white placeholder-white/25 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            {error && (
              <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p>
            )}
          </div>

          <button
            onClick={handleContinue}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
