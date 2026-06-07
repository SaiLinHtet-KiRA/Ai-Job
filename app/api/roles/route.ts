import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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
