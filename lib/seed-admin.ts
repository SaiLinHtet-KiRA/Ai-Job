import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.");
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) return;

    const { error } = await supabase.from("admins").insert({
      email,
      password_hash: hashPassword(password),
    });

    if (error) {
      console.error("Failed to seed admin user:", error.message);
    } else {
      console.log(`Admin "${email}" created.`);
    }
  } catch (err) {
    console.error("Admin seed error:", err);
  }
}
