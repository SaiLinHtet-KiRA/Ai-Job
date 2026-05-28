import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── load .env.local ──────────────────────────────────────────────
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const envPath = path.resolve(__dirname, "..", ".env.local");
loadEnv(envPath);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── helpers ──────────────────────────────────────────────────────
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── main ─────────────────────────────────────────────────────────
async function seed() {
  const jobPath = path.resolve(__dirname, "..", "app", "data", "job.json");
  const raw = JSON.parse(fs.readFileSync(jobPath, "utf8"));

  console.log(`Loaded ${raw.length} jobs from job.json`);

  // 1) Collect unique titles
  const uniqueTitles = [...new Set(raw.map((j) => j.title))];
  console.log(`Found ${uniqueTitles.length} unique titles`);

  // 2) Upsert titles in batches of 100
  for (const batch of chunk(uniqueTitles, 100)) {
    const { error } = await supabase.from("titles").upsert(
      batch.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true },
    );
    if (error) {
      console.error("Error upserting titles:", error.message);
      process.exit(1);
    }
  }

  // 3) Fetch all titles so we can map name → id
  const { data: titleRows, error: titleErr } = await supabase
    .from("titles")
    .select("id, name");

  if (titleErr) {
    console.error("Error fetching titles:", titleErr.message);
    process.exit(1);
  }

  const titleMap = Object.fromEntries(titleRows.map((t) => [t.name, t.id]));
  console.log(`Matched ${titleRows.length} titles in DB`);

  // 4) Prepare job inserts
  const jobRows = raw.map((job) => ({
    title: job.title,
    title_id: titleMap[job.title] || null,
    email: job.email || "",
    image_url: job.imageUrl || "",
    created_at: job.createdAt || new Date().toISOString(),
  }));

  // 5) Insert jobs in batches of 100
  let inserted = 0;
  for (const batch of chunk(jobRows, 100)) {
    const { error } = await supabase.from("jobs").insert(batch);
    if (error) {
      console.error("Error inserting jobs:", error.message);
      process.exit(1);
    }
    inserted += batch.length;
  }

  console.log(`\nDone — inserted ${inserted} jobs`);
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
