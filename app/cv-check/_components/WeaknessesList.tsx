export default function WeaknessesList({ weaknesses }: { weaknesses: string[] }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-rose-400">What to fix</p>
      <ul className="space-y-2.5">
        {weaknesses.map((w, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/80">
            <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
