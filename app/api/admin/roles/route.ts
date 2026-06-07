import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/admin/roles — list all roles (from roles table + distinct role_courses)
export async function GET() {
  const supabase = getSupabaseAdmin();

  const [rolesRes, coursesRes] = await Promise.all([
    supabase.from("roles").select("id, name").order("name", { ascending: true }),
    supabase.from("role_courses").select("role"),
  ]);

  const roleNames = new Set<string>();

  if (!rolesRes.error && rolesRes.data) {
    rolesRes.data.forEach((r: { name: string }) => roleNames.add(r.name));
  }

  if (!coursesRes.error && coursesRes.data) {
    coursesRes.data.forEach((r: { role: string }) => roleNames.add(r.role));
  }

  const merged = Array.from(roleNames)
    .sort()
    .map((name) => ({ name }));

  return NextResponse.json(merged);
}

// POST /api/admin/roles — create a new role
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Role name is required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("roles")
    .insert({ name: name.trim().toLowerCase() })
    .select("id, name")
    .single();

  if (error) {
    // duplicate role name
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This role already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/admin/roles?name=... — delete a role
export async function DELETE(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Role name is required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  await supabase.from("role_courses").delete().eq("role", name);

  const { error } = await supabase.from("roles").delete().eq("name", name);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
