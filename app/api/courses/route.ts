import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/courses?role=frontend+developer&page=1&limit=20
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  if (!role) {
    return NextResponse.json(
      { error: "role query parameter is required." },
      { status: 400 },
    );
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  const { data, error, count } = await supabase
    .from("role_courses")
    .select("sort_order, courses(id, title, url, platform, duration, level, description, instructor, created_at)", { count: "exact" })
    .eq("role", role.toLowerCase())
    .order("sort_order", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const courses = (data ?? []).map((item) => ({
    ...item.courses,
    sort_order: item.sort_order,
  }));

  return NextResponse.json({
    role,
    data: courses,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
