type EmailGateProps = {
  email: string;
  emailError: string | null;
  emailSent: boolean;
  emailLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function EmailGate({ email, emailError, emailSent, emailLoading, onEmailChange, onSubmit, onKeyDown }: EmailGateProps) {
  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-primary/[0.06] p-6">
      {!emailSent ? (
        <>
          <p className="text-[15px] font-semibold text-white">
            Get your full keyword report
          </p>
          <p className="mt-1 text-[13px] text-[#8898aa]">
            We&apos;ll also notify you when we find jobs that match your profile.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={onEmailChange}
              onKeyDown={onKeyDown}
              className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            <button
              onClick={onSubmit}
              disabled={emailLoading}
              className="h-10 rounded-lg bg-primary px-5 text-[13px] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
            >
              {emailLoading ? "Sending..." : "Send report"}
            </button>
          </div>
          {emailError && (
            <p className="mt-2 text-[12px] font-medium text-rose-400">{emailError}</p>
          )}
          <p className="mt-3 text-[11px] text-[#8898aa]/50">
            We never share your CV with employers without your approval.
          </p>
        </>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">Check your inbox</p>
            <p className="mt-1 text-[13px] text-[#8898aa]">
              We&apos;ve sent your full keyword report to <span className="text-white">{email}</span>. We&apos;ll also notify you when matching jobs are available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
