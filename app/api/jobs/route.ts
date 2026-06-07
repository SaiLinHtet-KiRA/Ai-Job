import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Search job listings by keyword
 * @description Returns all job listings, optionally filtered by a title keyword (case-insensitive partial match).
 * @tags ["Jobs"]
 */
export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`jobs:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    const title = req.nextUrl.searchParams.get("title");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("job_listings")
      .select("id, title, company, location, job_type, salary_range, skills, description, apply_url, apply_email, created_at")
      .order("created_at", { ascending: false });

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
