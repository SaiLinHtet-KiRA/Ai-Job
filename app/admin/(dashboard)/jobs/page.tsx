import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { JobListClient } from "./JobListClient";

interface Job {
  id: number;
  title: string;
  company: string;
  email: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export default async function AdminJobsPage() {
  let jobs: Job[] = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    jobs = data ?? [];
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Job Posts
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage all job listings
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-purple-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Job
        </Link>
      </div>

      <JobListClient initialJobs={jobs} />
    </div>
  );
}
