import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * List all applications (admin)
 * @tags ["Admin - Applications"]
 */
export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-applications:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10) || 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getSupabaseAdmin();
    const [{ data, error }, { count: total }] = await Promise.all([
      supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true }),
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      page,
      limit,
      total: total ?? 0,
      totalPages: Math.max(1, Math.ceil((total ?? 0) / limit)),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
