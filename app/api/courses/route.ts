import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/courses?role=frontend+developer
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  if (!role) {
    return NextResponse.json(
      { error: "role query parameter is required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("role_courses")
    .select("sort_order, courses(id, title, url, platform, duration, level, description)")
    .eq("role", role.toLowerCase())
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the response
  const courses = (data ?? []).map((item) => ({
    ...item.courses,
    sort_order: item.sort_order,
  }));

  return NextResponse.json({ role, courses });
}
