import ScoreCard from "./ScoreCard";
import StrengthsList from "./StrengthsList";
import WeaknessesList from "./WeaknessesList";
import SummaryCard from "./SummaryCard";
import EmailGate from "./EmailGate";
import JobMatchesTeaser from "./JobMatchesTeaser";
import { ScoreResult, MatchedJob } from "./types";

type CVCheckResultsProps = {
  result: ScoreResult;
  email: string;
  emailError: string | null;
  emailSent: boolean;
  emailLoading: boolean;
  matchedJobs: MatchedJob[];
  matchLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailSubmit: () => void;
  onEmailKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

export default function CVCheckResults({
  result, email, emailError, emailSent, emailLoading,
  matchedJobs, matchLoading,
  onEmailChange, onEmailSubmit, onEmailKeyDown, onReset,
}: CVCheckResultsProps) {
  return (
    <div className="mx-auto max-w-lg text-left">
      <ScoreCard score={result.score} />
      <StrengthsList strengths={result.strengths} />
      <WeaknessesList weaknesses={result.weaknesses} />
      <SummaryCard summary={result.summary} />
      <EmailGate
        email={email}
        emailError={emailError}
        emailSent={emailSent}
        emailLoading={emailLoading}
        onEmailChange={onEmailChange}
        onSubmit={onEmailSubmit}
        onKeyDown={onEmailKeyDown}
      />
      <JobMatchesTeaser matchedJobs={matchedJobs} matchLoading={matchLoading} />

      <button
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-colors hover:text-primary-dark"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Score another CV
      </button>
    </div>
  );
}
