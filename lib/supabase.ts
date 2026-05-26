import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || url === "your_supabase_url_here") {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, key);
}

export function getSupabaseAdmin() {
  return getSupabase();
}
