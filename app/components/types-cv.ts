interface CV {
  id: number;
  fileName: string;
  url: string;
  uploadedAt: string;
  parsedText: string;
}

interface CVScore {
  score: number;
  strengths?: string[];
  weaknesses?: string[];
  keywords_missing?: string[];
  skills?: string[];
  summary?: string;
}

export type { CV, CVScore };
