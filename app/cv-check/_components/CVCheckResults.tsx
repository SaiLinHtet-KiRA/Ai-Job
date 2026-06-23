import ScoreCard from "./ScoreCard";
import StrengthsList from "./StrengthsList";
import WeaknessesList from "./WeaknessesList";
import SummaryCard from "./SummaryCard";
import { ScoreResult } from "./types";

type CVCheckResultsProps = {
  result: ScoreResult;
};

export default function CVCheckResults({ result }: CVCheckResultsProps) {
  return (
    <div className="mx-auto max-w-lg text-left">
      <ScoreCard score={result.score} />
      <StrengthsList strengths={result.strengths} />
      <WeaknessesList weaknesses={result.weaknesses} />
      <SummaryCard summary={result.summary} />
    </div>
  );
}
