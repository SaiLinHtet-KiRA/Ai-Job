export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  name: string;
  proficiency: "elementary" | "limited" | "professional" | "full" | "native";
}

export interface ProfileData {
  id: number;
  user_id: string;
  email: string;
  status: string;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  avatar_url: string | null;
  skills: string[];
  languages: Language[];
  website: string | null;
  linkedin_url: string | null;
  phone: string | null;
  work_experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  suitable_title: string[];
  experience_level: string;
  target_roles: string[];
  preferred_locations: string[];
  remote_ok: boolean;
  cv_file_url: string | null;
  cv_text: string | null;
  last_scored_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PROFICIENCY_LABELS: Record<Language["proficiency"], string> = {
  elementary: "Elementary",
  limited: "Limited Working",
  professional: "Professional Working",
  full: "Full Professional",
  native: "Native / Bilingual",
};
