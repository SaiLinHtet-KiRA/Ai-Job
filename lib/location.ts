import { getSupabaseAdmin } from "@/lib/supabase";

export async function incrementLocationJobsSize(location: string) {
  if (!location) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.rpc("increment_location_jobs_size", { loc_name: location });
  if (error) {
    // RPC might not exist yet; fallback to upsert
    await supabase.from("locations").upsert(
      { name: location, jobs_size: 1 },
      { onConflict: "name" },
    );
  }
}

export async function incrementTitleJobsSize(title: string) {
  if (!title) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.rpc("increment_title_jobs_size", { title_name: title });
  if (error) {
    // RPC might not exist yet; fallback to upsert
    await supabase.from("titles").upsert(
      { name: title, jobs_size: 1 },
      { onConflict: "name" },
    );
  }
}
