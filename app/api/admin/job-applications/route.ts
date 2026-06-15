import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const jobId = req.nextUrl.searchParams.get("job_id");

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

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "10", 10);
    const search = req.nextUrl.searchParams.get("search") || "";
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("job_listings")
      .select("id, title, company, location, job_type, applications, apply_email", { count: "exact", head: false })
      .not("applications", "eq", "[]")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data: jobs, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count: totalAppsCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true });

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

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      jobs: results,
      page,
      pageSize,
      total,
      totalPages,
      totalApps: totalAppsCount ?? 0,
    });
  } catch (err) {
    console.error("Job applications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
