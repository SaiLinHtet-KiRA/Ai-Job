import { scoreColor, scoreBg, scoreMessage } from "@/lib/style-helpers";

export default function ScoreCard({ score }: { score: number }) {
  return (
    <div className={`rounded-xl bg-gradient-to-b ${scoreBg(score)} border border-white/10 p-6`}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#8898aa]">Your ATS Score</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-6xl font-semibold tracking-[-0.03em] ${scoreColor(score)}`}>
          {score}
        </span>
        <span className="text-xl text-white/20">/100</span>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-[#8898aa]">{scoreMessage(score)}</p>
    </div>
  );
}
