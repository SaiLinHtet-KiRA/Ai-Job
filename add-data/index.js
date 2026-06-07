import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Jobs seeding ────────────────────────────────────────────

async function seedJobs() {
  const jobPath = path.resolve(__dirname, "data", "jobs.json");
  const raw = JSON.parse(fs.readFileSync(jobPath, "utf8"));

  console.log(`Loaded ${raw.length} jobs from jobs.json`);

  // 1) Collect unique titles and ensure they exist in titles table
  const uniqueTitles = [...new Set(raw.map((j) => j.title))];
  console.log(`Found ${uniqueTitles.length} unique titles`);

  let titlesCreated = 0;
  for (const batch of chunk(uniqueTitles, 100)) {
    const { data: existing } = await supabase
      .from("titles")
      .select("name")
      .in("name", batch);

    const existingNames = new Set((existing || []).map((t) => t.name));
    const toCreate = batch.filter((name) => !existingNames.has(name));

    if (toCreate.length > 0) {
      const { error } = await supabase
        .from("titles")
        .upsert(toCreate.map((name) => ({ name })), { onConflict: "name", ignoreDuplicates: true });
      if (error) {
        console.error("Error upserting titles:", error.message);
        return false;
      }
      titlesCreated += toCreate.length;
    }
  }
  console.log(`Created ${titlesCreated} new titles`);

  // 2) Collect unique locations and ensure they exist in locations table
  const uniqueLocations = [...new Set(raw.map((j) => j.location).filter(Boolean))];
  console.log(`Found ${uniqueLocations.length} unique locations`);

  let locationsCreated = 0;
  for (const batch of chunk(uniqueLocations, 100)) {
    const { data: existing } = await supabase
      .from("locations")
      .select("name")
      .in("name", batch);

    const existingNames = new Set((existing || []).map((l) => l.name));
    const toCreate = batch.filter((name) => !existingNames.has(name));

    if (toCreate.length > 0) {
      const { error } = await supabase
        .from("locations")
        .upsert(toCreate.map((name) => ({ name })), { onConflict: "name", ignoreDuplicates: true });
      if (error) {
        console.error("Error upserting locations:", error.message);
        return false;
      }
      locationsCreated += toCreate.length;
    }
  }
  console.log(`Created ${locationsCreated} new locations`);

  // 3) Insert job listings
  console.log("Inserting job listings...");

  const jobRows = raw.map((job) => ({
    title: job.title,
    company: job.company,
    location: job.location || "",
    job_type: job.job_type || "full-time",
    salary_range: job.salary_range || "",
    skills: job.skills || [],
    description: job.description || "",
    apply_url: job.apply_url || "",
    apply_email: job.apply_email || "",
    source: job.source || "manual",
    expires_at: new Date(
      Date.now() + (job.expires_in_days || 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));

  let inserted = 0;
  for (const batch of chunk(jobRows, 100)) {
    const { error } = await supabase.from("job_listings").insert(batch);
    if (error) {
      console.error("Error inserting job listings:", error.message);
      return false;
    }
    inserted += batch.length;
  }

  console.log(`Inserted ${inserted} job listings`);

  // 4) Increment jobs_size for each title
  console.log("Updating jobs_size counters...");

  const titleCounts = {};
  for (const job of raw) {
    titleCounts[job.title] = (titleCounts[job.title] || 0) + 1;
  }

  for (const [title, count] of Object.entries(titleCounts)) {
    const { error: rpcErr } = await supabase.rpc("increment_title_jobs_size", {
      title_name: title,
      increment_by: count,
    });

    if (rpcErr) {
      const { data: row } = await supabase
        .from("titles")
        .select("id, jobs_size")
        .eq("name", title)
        .single();

      if (row) {
        await supabase
          .from("titles")
          .update({ jobs_size: row.jobs_size + count })
          .eq("id", row.id);
      }
    }
  }

  console.log(`Updated jobs_size for ${Object.keys(titleCounts).length} titles`);

  // 5) Increment jobs_size for each location
  console.log("Updating location jobs_size counters...");

  const locationCounts = {};
  for (const job of raw) {
    if (job.location) {
      locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
    }
  }

  for (const [location, count] of Object.entries(locationCounts)) {
    const { error: rpcErr } = await supabase.rpc("increment_location_jobs_size", {
      loc_name: location,
      increment_by: count,
    });

    if (rpcErr) {
      const { data: row } = await supabase
        .from("locations")
        .select("id, jobs_size")
        .eq("name", location)
        .single();

      if (row) {
        await supabase
          .from("locations")
          .update({ jobs_size: row.jobs_size + count })
          .eq("id", row.id);
      }
    }
  }

  console.log(`Updated jobs_size for ${Object.keys(locationCounts).length} locations`);
  return true;
}

// ── Courses seeding ─────────────────────────────────────────

async function ensureRole(roleName) {
  const name = roleName.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("roles")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase
    .from("roles")
    .insert({ name });

  if (error && error.code !== "23505") {
    throw new Error(`Failed to create role "${name}": ${error.message}`);
  }

  console.log(`  + Created role: ${name}`);
}

async function seedCourses() {
  const coursesPath = path.resolve(__dirname, "data", "courses.json");
  const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));

  console.log(`Seeding ${coursesData.length} courses to Supabase...`);

  for (let i = 0; i < coursesData.length; i++) {
    const { title, url, platform, duration, level, roles } = coursesData[i];

    const { data: inserted, error: courseError } = await supabase
      .from("courses")
      .insert({ title, url, platform: platform.toLowerCase(), duration, level })
      .select("id")
      .single();

    if (courseError) {
      console.error(`  [${i + 1}/${coursesData.length}] ERROR "${title}": ${courseError.message}`);
      continue;
    }

    if (roles && Array.isArray(roles) && roles.length > 0) {
      for (const roleName of roles) {
        await ensureRole(roleName);
      }

      const roleLinks = roles.map((roleName) => ({
        role: roleName.toLowerCase().trim(),
        course_id: inserted.id,
        sort_order: 0,
      }));

      const { error: linkError } = await supabase
        .from("role_courses")
        .insert(roleLinks);

      if (linkError) {
        console.error(`  [${i + 1}/${coursesData.length}] WARN role link for "${title}": ${linkError.message}`);
      }
    }

    console.log(`  [${i + 1}/${coursesData.length}] OK  "${title}"`);
  }

  return true;
}

// ── Main ────────────────────────────────────────────────────

async function seed() {
  console.log("=== Seeding jobs ===\n");
  const jobsOk = await seedJobs();
  if (!jobsOk) {
    console.error("\nJobs seeding failed. Aborting.");
    process.exit(1);
  }

  console.log("\n=== Seeding courses ===\n");
  const coursesOk = await seedCourses();
  if (!coursesOk) {
    console.error("\nCourses seeding failed.");
    process.exit(1);
  }

  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
