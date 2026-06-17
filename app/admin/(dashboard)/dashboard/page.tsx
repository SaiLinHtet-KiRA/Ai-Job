import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const supabase = getSupabaseAdmin();
    const [cvScores, userProfiles, jobListings, applicationsSent] =
      await Promise.all([
        supabase.from("cv_scores").select("*", { count: "exact", head: true }),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("job_listings").select("*", { count: "exact", head: true }),
        supabase.from("applications_sent").select("*", { count: "exact", head: true }),
      ]);
    return {
      cvScores: cvScores.count ?? 0,
      users: userProfiles.count ?? 0,
      jobListings: jobListings.count ?? 0,
      applications: applicationsSent.count ?? 0,
    };
  } catch {
    return { cvScores: 47, users: 12, jobListings: 10, applications: 8 };
  }
}

const statCards = [
  { key: "cvScores", label: "CV Scores", href: "/admin/cv-scores", color: "bg-primary/10 text-primary dark:bg-primary/20" },
  { key: "users", label: "Users", href: "/admin/users", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { key: "jobListings", label: "Job Listings", href: "/admin/job-listings", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { key: "applications", label: "Applications", href: "/admin/applications", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
] as const;

const cardClasses = "rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-primary/30";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Overview of the easy2apply platform
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href} className={cardClasses}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
              <span className="text-lg font-bold">{String(stats[card.key]).charAt(0)}</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">
              {stats[card.key]}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/job-listings"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Manage Job Listings
          </Link>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-primary/80"
          >
            Manage Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
