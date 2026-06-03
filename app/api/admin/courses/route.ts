import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/admin/courses — list all courses (with optional role filter)
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  const supabase = getSupabaseAdmin();

  let query = supabase.from("courses").select("*, role_courses(role, sort_order)");

  if (role) {
    query = supabase
      .from("role_courses")
      .select("sort_order, courses(*)")
      .eq("role", role)
      .order("sort_order", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/courses — create a new course + optionally link to roles
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, url, platform, duration, level, description, roles } = body;

  if (!title || !url) {
    return NextResponse.json(
      { error: "Title and URL are required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  // Insert course
  const { data: course, error } = await supabase
    .from("courses")
    .insert({ title, url, platform, duration, level, description })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Link to roles if provided
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const roleLinks = roles.map((r: { role: string; sort_order?: number }) => ({
      role: r.role,
      course_id: course.id,
      sort_order: r.sort_order ?? 0,
    }));

    const { error: linkError } = await supabase.from("role_courses").insert(roleLinks);
    if (linkError) {
      console.error("Failed to link roles:", linkError);
    }
  }

  return NextResponse.json(course, { status: 201 });
}
