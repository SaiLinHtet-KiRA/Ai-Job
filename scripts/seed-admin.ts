import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@easy2apply.work";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const { data: existing } = await supabase
    .from("admins")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .single();

  if (existing) {
    console.log(`Admin "${ADMIN_EMAIL}" already exists, skipping.`);
    return;
  }

  const { error } = await supabase.from("admins").insert({
    email: ADMIN_EMAIL,
    password_hash: hashPassword(ADMIN_PASSWORD),
  });

  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }

  console.log(`Admin "${ADMIN_EMAIL}" created successfully.`);
}

main();
