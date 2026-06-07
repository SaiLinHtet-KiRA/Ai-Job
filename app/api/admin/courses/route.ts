import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/admin/courses — list all courses (with optional role filter & pagination)
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  if (role) {
    const { data, error, count } = await supabase
      .from("role_courses")
      .select("sort_order, courses(*)", { count: "exact", head: false })
      .eq("role", role)
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
      data: courses,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  }

  const { data, error, count } = await supabase
    .from("courses")
    .select("*, role_courses(role, sort_order)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
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
