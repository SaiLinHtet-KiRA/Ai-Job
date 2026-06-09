import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUserProfile } from "@/lib/user-profile";

// GET /api/profile — get current user's profile
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = session.user.id;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

// POST /api/profile — create or update user profile from CV data
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = session.user.id;
  const profile = await getUserProfile(userId);
  const email = profile?.email;

  if (!email) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const body = await req.json();
  const {
    suitable_title,
    experience_level,
    target_roles,
    preferred_locations,
    remote_ok,
    cv_text,
    password,
  } = body;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      email,
      suitable_title: suitable_title ?? [],
      experience_level: experience_level ?? "mid",
      target_roles: target_roles ?? [],
      preferred_locations: preferred_locations ?? [],
      remote_ok: remote_ok ?? true,
      cv_text: cv_text ?? null,
      password: password ?? null,
      last_scored_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("Profile upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
