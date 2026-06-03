export default function StrengthsList({ strengths }: { strengths: string[] }) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-emerald-400">What&apos;s working</p>
      <ul className="space-y-2.5">
        {strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/80">
            <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
