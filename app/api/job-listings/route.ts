import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * List job listings with pagination and filters
 * @description Supports search, location, type, page, and limit query params. Returns paginated results.
 * @tags ["Job Listings"]
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const search = searchParams.get("search")?.trim() ?? "";
    const location = searchParams.get("location")?.trim() ?? "";
    const jobType = searchParams.get("type")?.trim() ?? "";

    const supabase = getSupabaseAdmin();
    const offset = (page - 1) * limit;

    let query = supabase
      .from("job_listings")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }
    if (location) {
      query = query.ilike("location", `%${location}%`);
    }
    if (jobType) {
      query = query.eq("job_type", jobType);
    }

    query = query
      .order("created_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
