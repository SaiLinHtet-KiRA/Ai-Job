export type ScoreResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
};

export type MatchedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  missing_skills: string[];
};
