type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  apply_email: string | null;
  apply_url: string | null;
};

type Match = {
  id: number;
  match_score: number;
  missing_skills: string[];
  cover_letter: string;
  status: string;
  matched_at: string;
  job_listings: JobListing;
  selected?: boolean;
};

export type { JobListing, Match };
