import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Get jobs with applications
 * @description Returns jobs that have applications, with counts and application data.
 * @tags ["Admin - Applications"]
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const jobId = req.nextUrl.searchParams.get("job_id");

    // Return applications for a specific job
    if (jobId) {
      const idsParam = req.nextUrl.searchParams.get("ids");
      let applicationIds: number[] = [];

      if (idsParam) {
        applicationIds = idsParam.split(",").map(Number).filter((n) => !isNaN(n));
      }

      if (applicationIds.length === 0) {
        return NextResponse.json({ applications: [] });
      }

      const { data: applications, error } = await supabase
        .from("applications")
        .select("id, name, email, position, type, salary, cv_url, cover_letter, method, status, sent_at, created_at, user_id")
        .in("id", applicationIds)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ applications: applications ?? [] });
    }

    // Return all jobs that have applications
    const { data: jobs, error } = await supabase
      .from("job_listings")
      .select("id, title, company, location, job_type, applications, apply_email")
      .not("applications", "eq", "[]")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = (jobs ?? []).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      apply_email: job.apply_email,
      applicationCount: (job.applications as number[])?.length ?? 0,
      applicationIds: (job.applications as number[]) ?? [],
    }));

    return NextResponse.json({ jobs: results });
  } catch (err) {
    console.error("Job applications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
