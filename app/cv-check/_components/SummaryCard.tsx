export default function SummaryCard({ summary }: { summary: string }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-[14px] leading-relaxed text-[#8898aa]">{summary}</p>
    </div>
  );
}
