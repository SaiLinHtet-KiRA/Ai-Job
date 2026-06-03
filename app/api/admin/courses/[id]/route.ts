import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/courses/:id
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("courses")
    .select("*, role_courses(role, sort_order)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/admin/courses/:id — update course fields
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const { title, url, platform, duration, level, description, roles } = body;

  const supabase = getSupabaseAdmin();

  // Update course fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (url !== undefined) updates.url = url;
  if (platform !== undefined) updates.platform = platform;
  if (duration !== undefined) updates.duration = duration;
  if (level !== undefined) updates.level = level;
  if (description !== undefined) updates.description = description;

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Replace role links if provided
  if (roles && Array.isArray(roles)) {
    await supabase.from("role_courses").delete().eq("course_id", id);

    if (roles.length > 0) {
      const roleLinks = roles.map((r: { role: string; sort_order?: number }) => ({
        role: r.role,
        course_id: Number(id),
        sort_order: r.sort_order ?? 0,
      }));
      await supabase.from("role_courses").insert(roleLinks);
    }
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/courses/:id
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
