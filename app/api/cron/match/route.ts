import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  apply_email: string | null;
  apply_url: string | null;
};

type UserProfile = {
  user_id: string;
  email: string;
  skills: string[];
  experience_level: string;
  target_roles: string[];
  preferred_locations: string[];
  remote_ok: boolean;
};

function computeMatchScore(user: UserProfile, job: JobListing): { score: number; missing: string[] } {
  const userSkills = (user.skills ?? []).map((s: string) => s.toLowerCase());
  const jobSkills = (job.skills ?? []).map((s: string) => s.toLowerCase());

  if (jobSkills.length === 0) return { score: 50, missing: [] };

  const matched = jobSkills.filter((s) => userSkills.includes(s));
  const missing = jobSkills.filter((s) => !userSkills.includes(s));
  const skillScore = (matched.length / jobSkills.length) * 100;

  // Location bonus
  let locationBonus = 0;
  const jobLoc = (job.location ?? "").toLowerCase();
  if (jobLoc.includes("remote") && user.remote_ok) {
    locationBonus = 10;
  } else if (user.preferred_locations?.some((loc) => jobLoc.includes(loc.toLowerCase()))) {
    locationBonus = 10;
  }

  const score = Math.min(100, Math.round(skillScore * 0.8 + locationBonus + Math.random() * 5));

  return {
    score,
    missing: missing.map((s) => job.skills.find((js: string) => js.toLowerCase() === s) || s),
  };
}

function generateMockCoverLetter(user: UserProfile, job: JobListing): string {
  const skills = (user.skills ?? []).slice(0, 3).join(", ");
  return `Dear Hiring Manager,

I'm writing to express my strong interest in the ${job.title} position at ${job.company}. With my experience in ${skills || "software development"}, I believe I'm a strong fit for this role.

${job.location?.includes("Remote") ? "I'm excited about the opportunity to work remotely and bring my skills to your distributed team." : `I'm enthusiastic about the opportunity to contribute to your team in ${job.location}.`}

I've reviewed the requirements and I'm confident that my background aligns well with what you're looking for. I'm particularly drawn to this role because it offers the chance to work on meaningful problems with a strong technical team.

I'd love the opportunity to discuss how my experience can contribute to ${job.company}'s goals. I'm available for a conversation at your earliest convenience.

Best regards`;
}

// POST /api/cron/match — run daily matching for all users
// In production: triggered by Vercel Cron or external scheduler
export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // 1. Get all user profiles
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("*");

  if (profileError || !profiles?.length) {
    return NextResponse.json({
      success: true,
      message: "No profiles to match.",
      matched: 0,
    });
  }

  // 2. Get recent job listings (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: jobs, error: jobError } = await supabase
    .from("job_listings")
    .select("*")
    .gte("posted_at", weekAgo)
    .order("posted_at", { ascending: false });

  if (jobError || !jobs?.length) {
    return NextResponse.json({
      success: true,
      message: "No recent jobs to match against.",
      matched: 0,
    });
  }

  // 3. For each user, find top 5 matches
  let totalMatches = 0;

  for (const profile of profiles) {
    const scored = jobs.map((job: JobListing) => {
      const { score, missing } = computeMatchScore(profile, job);
      return { job, score, missing };
    });

    // Sort by score, take top 5 above threshold
    const top = scored
      .filter((m) => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    for (const match of top) {
      const coverLetter = generateMockCoverLetter(profile, match.job);

      await supabase.from("daily_matches").upsert(
        {
          user_id: profile.user_id,
          job_id: match.job.id,
          match_score: match.score,
          missing_skills: match.missing,
          cover_letter: coverLetter,
          status: "pending",
          matched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,job_id,matched_at" },
      );

      totalMatches++;
    }
  }

  return NextResponse.json({
    success: true,
    profiles_processed: profiles.length,
    jobs_available: jobs.length,
    matches_created: totalMatches,
  });
}
