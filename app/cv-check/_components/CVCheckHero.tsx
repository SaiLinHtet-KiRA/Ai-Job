export default function CVCheckHero() {
  return (
    <div className="max-w-xl">
      <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
        Free CV analysis
      </p>
      <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
        Find out if your CV will pass the ATS filter
      </h1>
      <p className="mt-6 max-w-lg text-[17px] leading-[1.7] text-[#8898aa]">
        Upload your CV and get an instant score with specific, actionable feedback.
        Free. No sign-up needed.
      </p>
      <div className="mt-8 flex items-center gap-5 text-[13px] text-[#8898aa]/50">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No sign-up
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          100% free
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instant results
        </span>
      </div>
    </div>
  );
}
