import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

export interface UserProfile {
  id: number;
  user_id: string;
  email: string;
  status: string;
  suitable_title: string[];
  experience_level: string;
  target_roles: string[];
  preferred_locations: string[];
  remote_ok: boolean;
  cv_file_url: string | null;
  cv_text: string | null;
  last_scored_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as UserProfile | null;
}

export async function ensureUserProfile(
  userId: string,
  email: string,
  name?: string | null,
): Promise<void> {
  const supabase = supabaseAdmin();

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from("user_profiles").insert({
    user_id: userId,
    email,
    status: "active",
    suitable_title: [],
    target_roles: [],
    preferred_locations: [],
    experience_level: name ? "mid" : "mid",
    remote_ok: true,
  });
}

export async function isUserBanned(userId: string): Promise<boolean> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("user_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.status === "banned";
}

export async function updateUserSuitableTitle(
  userId: string,
  suitableTitle: string[],
): Promise<void> {
  const supabase = supabaseAdmin();
  await supabase
    .from("user_profiles")
    .update({
      suitable_title: suitableTitle,
      last_scored_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
