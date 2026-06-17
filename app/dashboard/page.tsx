import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getUserProfile } from "@/lib/user-profile";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import TopNav from "../components/TopNav";
import MatchesFeed from "./MatchesFeed";
import { Suspense } from "react";

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  apply_email: string | null;
  apply_url: string | null;
};

type MatchResult = {
  job_listings: JobListing;
  match_score: number;
};

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const profile = await getUserProfile(session.user.id);
  if (!profile) return null;

  if (profile.status === "banned") {
    throw new Error("banned");
  }

  return {
    id: profile.user_id,
    email: profile.email,
    status: profile.status,
    suitable_title: profile.suitable_title ?? [],
  };
}

async function hasCV(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("user_cvs")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

function computeMatchScore(
  suitableTitle: string[],
  job: { title: string; location: string },
): number {
  const userTitles = suitableTitle.map((s) => s.toLowerCase());
  const jobTitle = (job.title ?? "").toLowerCase();

  if (userTitles.length === 0) return 50;

  const jobTokens = jobTitle.split(/[\s,/-]+/).filter((t) => t.length > 2);
  const matched = userTitles.filter((ut) =>
    jobTokens.some((jt) => jt.includes(ut) || ut.includes(jt)),
  );
  const titleScore = (matched.length / userTitles.length) * 100;

  return Math.min(100, Math.round(titleScore * 0.8 + Math.random() * 5));
}

async function getJobMatches(
  suitableTitle: string[],
): Promise<MatchResult[]> {
  const supabase = getSupabaseAdmin();

  const { data: jobs } = await supabase
    .from("job_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (!jobs?.length) return [];

  const scored = jobs.map((job) => ({
    job_listings: job,
    match_score: computeMatchScore(suitableTitle, job),
  }));

  return scored
    .filter((m) => m.match_score >= 40)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10);
}

async function getDashboardStats(userId: string, email: string) {
  const supabase = getSupabaseAdmin();

  const { count: applicationsSent } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: cvScore } = await supabase
    .from("cv_scores")
    .select("score")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    applicationsSent: applicationsSent ?? 0,
    profileScore: cvScore?.score ?? 0,
  };
}

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userHasCV = await hasCV(user.id);
  const stats = userHasCV ? await getDashboardStats(user.id, user.email) : null;
  const matches = userHasCV && user.suitable_title.length > 0
    ? await getJobMatches(user.suitable_title)
    : [];

  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back, {user.email?.split("@")[0]}
            </h1>
            <p className="mt-1 text-[14px] text-[#8898aa]">
              Here&apos;s what&apos;s happening with your job search
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/profile"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Update CV</p>
                <p className="text-[12px] text-[#8898aa]">Keep your profile fresh</p>
              </div>
            </Link>
            <Link
              href="/roadmap"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Skill Roadmap</p>
                <p className="text-[12px] text-[#8898aa]">Close your gaps</p>
              </div>
            </Link>
            <Link
              href="/applications"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">My Applications</p>
                <p className="text-[12px] text-[#8898aa]">Track progress</p>
              </div>
            </Link>
            <Link
              href="/jobs"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Browse Jobs</p>
                <p className="text-[12px] text-[#8898aa]">Explore all listings</p>
              </div>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">Applications Sent</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats?.applicationsSent ?? 0}</p>
              <p className="mt-1 text-[12px] text-[#8898aa]">Total sent</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">CV Score</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats?.profileScore ?? 0}</p>
              <p className="mt-1 text-[12px] text-[#8898aa]">Out of 100</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">Suitable Title</p>
              <p className="mt-2 text-lg font-bold text-white truncate">
                {user.suitable_title.length > 0 ? user.suitable_title[0] : !userHasCV ? (
                  <Link href="/profile" className="text-primary hover:underline">Upload your CV</Link>
                ) : "N/A"}
              </p>
              <p className="mt-1 text-[12px] text-[#8898aa]">Top match title</p>
            </div>
          </div>

          {/* Main Content */}
          {userHasCV ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Top Matches</h2>
                  <p className="text-[13px] text-[#8898aa]">
                    Select jobs you want to apply to
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
                >
                  Browse All Jobs
                </Link>
              </div>

              {user.suitable_title.length > 0 && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[12px] font-medium uppercase text-[#8898aa]">Your skills from CV</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.suitable_title.map((title) => (
                      <span
                        key={title}
                        className="rounded-md bg-primary/15 px-2.5 py-1 text-[13px] font-medium text-primary"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />}>
                <MatchesFeed serverMatches={matches} />
              </Suspense>
            </>
          ) : (
            /* No CV - Show Upload Prompt */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-16 px-6 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Upload Your CV to Get Started</h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[#8898aa]">
                Our AI will analyze your skills and experience to find your perfect job matches
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/profile"
                  className="rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-primary-dark"
                >
                  Upload CV
                </Link>
                <Link
                  href="/cv-check"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-white/[0.05]"
                >
                  Check CV Score First
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-[13px] text-[#8898aa]">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-Powered Matching
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  One-Click Apply
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track Progress
                </span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
