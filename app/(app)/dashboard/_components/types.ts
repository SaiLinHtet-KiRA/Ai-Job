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
  job_listings: JobListing;
  match_score: number;
};

export type { JobListing, Match };
