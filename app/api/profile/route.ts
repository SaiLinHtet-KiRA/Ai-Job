import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUserProfile, updateUserProfile } from "@/lib/user-profile";
import { profileUpdateSchema, formatZodError } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = session.user.id;

  const profile = await getUserProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed) }, { status: 400 });
  }

  const updated = await updateUserProfile(userId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return NextResponse.json(updated);
}
