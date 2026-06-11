import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated, getSessionEmail } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit";
import { scoreCV } from "@/lib/cv-scorer";

async function handleIngest() {
  const supabase = getSupabaseAdmin();

  const MOCK_JOBS = [
    { external_id: "rem-001", title: "Frontend Developer", company: "CloudBase", location: "Remote", job_type: "full-time", skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"], description: "Build and maintain our customer-facing web application using React and Next.js.", apply_url: "https://example.com/apply/frontend-cloudbase", apply_email: "jobs@cloudbase.io", source: "mock" },
    { external_id: "rem-002", title: "Backend Engineer", company: "DataFlow", location: "Singapore", job_type: "full-time", skills: ["Node.js", "PostgreSQL", "Docker", "AWS"], description: "Design and implement scalable APIs and microservices.", apply_url: "https://example.com/apply/backend-dataflow", apply_email: "careers@dataflow.sg", source: "mock" },
    { external_id: "rem-003", title: "Full Stack Developer", company: "StartupHub", location: "Remote (APAC)", job_type: "full-time", skills: ["React", "Node.js", "PostgreSQL", "TypeScript"], description: "End-to-end feature development from database to UI.", apply_url: "https://example.com/apply/fullstack-startuphub", apply_email: "hire@startuphub.co", source: "mock" },
    { external_id: "rem-004", title: "React Native Developer", company: "Appify", location: "Bangkok", job_type: "full-time", skills: ["React Native", "TypeScript", "Firebase"], description: "Build cross-platform mobile apps.", apply_url: "https://example.com/apply/mobile-appify", apply_email: "", source: "mock" },
    { external_id: "rem-005", title: "Data Analyst", company: "PulseTech", location: "Remote", job_type: "full-time", skills: ["Python", "SQL", "Pandas", "Tableau"], description: "Turn raw data into actionable insights.", apply_url: "https://example.com/apply/data-pulsetech", apply_email: "data-team@pulsetech.io", source: "mock" },
  ];

  let inserted = 0, skipped = 0;
  for (const job of MOCK_JOBS) {
    const { error } = await supabase.from("job_listings").upsert(job, { onConflict: "source,external_id" });
    if (error) { skipped++; } else { inserted++; }
  }

  return { inserted, skipped, total: MOCK_JOBS.length };
}

async function handleMatching() {
  const supabase = getSupabaseAdmin();

  const { data: users } = await supabase
    .from("user_profiles")
    .select("user_id, email, suitable_title")
    .not("suitable_title", "eq", "{}")
    .not("suitable_title", "is", null);

  if (!users?.length) return { matched_users: 0, matches_created: 0 };

  let matchedUsers = 0;
  let matchesCreated = 0;

  for (const user of users) {
    const titles = user.suitable_title;
    if (!Array.isArray(titles) || titles.length === 0) continue;

    const { data: jobs } = await supabase
      .from("job_listings")
      .select("id, title, company")
      .or(titles.map((t: string) => `title.ilike.%${t}%`).join(","))
      .limit(5);

    if (!jobs?.length) continue;

    matchedUsers++;

    const matchTitles = jobs.map((j: { title: string }) => j.title).join(", ");

    const { error } = await supabase.from("notifications").insert({
      user_id: user.user_id,
      type: "match_found",
      title: "New job matches",
      message: `We found ${jobs.length} new job${jobs.length > 1 ? "s" : ""} matching your profile: ${matchTitles}`,
      data: { matches: jobs.map((j: { id: number; title: string; company: string }) => ({ job_id: j.id, title: j.title, company: j.company })) },
    });

    if (!error) matchesCreated++;
  }

  return { matched_users: matchedUsers, matches_created: matchesCreated };
}

async function handleDigest() {
  const supabase = getSupabaseAdmin();

  const { data: users } = await supabase
    .from("notifications")
    .select("user_id")
    .eq("read", false)
    .eq("type", "match_found");

  if (!users?.length) return { digest_sent: 0 };

  const uniqueUsers = [...new Set(users.map((u: { user_id: string }) => u.user_id))];

  let sent = 0;
  for (const userId of uniqueUsers) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.email) continue;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type: "system",
      title: "Daily Digest",
      message: `You have ${count ?? 0} unread notifications. Check your dashboard for the latest job matches.`,
      data: { unread_count: count ?? 0 },
    });

    if (!error) sent++;
  }

  return { digest_sent: sent, users_with_matches: uniqueUsers.length };
}

async function handleRescore() {
  const supabase = getSupabaseAdmin();

  const { data: cvs } = await supabase
    .from("user_cvs")
    .select("id, user_id, storage_path, file_name, parsed_text");

  if (!cvs?.length) return { rescored: 0, failed: 0 };

  let rescored = 0;
  let failed = 0;

  for (const cv of cvs) {
    try {
      const { data: fileData } = await supabase.storage
        .from("cvs")
        .download(cv.storage_path);

      if (!fileData) { failed++; continue; }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("user_id", cv.user_id)
        .maybeSingle();

      const result = await scoreCV({
        buffer,
        fileName: cv.file_name,
        fileType: "application/pdf",
        fileSize: buffer.length,
        email: profile?.email ?? "",
      });

      await supabase.from("notifications").insert({
        user_id: cv.user_id,
        type: "system",
        title: "CV Re-scored",
        message: `Your CV has been re-scored by our team. New ATS score: ${result.score}/100. ${result.summary}`,
        data: { score: result.score, cv_score_id: result.cv_score_id },
      });

      rescored++;
    } catch {
      failed++;
    }
  }

  return { rescored, failed, total: cvs.length };
}

async function handleCleanup() {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from("applications_sent")
    .delete({ count: "exact" })
    .lt("sent_at", cutoff);

  if (error) throw error;

  return { deleted: count ?? 0 };
}

async function handleExport() {
  const supabase = getSupabaseAdmin();

  const tables = [
    "user_profiles",
    "user_cvs",
    "cv_scores",
    "job_listings",
    "applications",
    "applications_sent",
    "leads",
    "email_logs",
    "audit_logs",
    "notifications",
  ];

  const result: Record<string, unknown[]> = {};

  for (const table of tables) {
    const { data } = await supabase.from(table).select("*").limit(5000);
    result[table] = data ?? [];
  }

  return result;
}

/**
 * Run admin actions
 * @description Execute system operations: ingest (seed jobs), matching (match users to jobs), digest (send digest notifications), rescore (re-score all CVs with AI), cleanup (delete old applications), export (download full DB as JSON).
 * @tags ["Admin - Actions"]
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();
    const adminEmail = (await getSessionEmail()) ?? "unknown";

    let result: unknown;

    switch (action) {
      case "ingest":
        result = await handleIngest();
        logAuditAction({ adminEmail, action: "job_ingestion_ran", details: `Ingested ${(result as { total: number }).total} jobs` });
        break;

      case "matching":
        result = await handleMatching();
        logAuditAction({ adminEmail, action: "matching_ran", details: `Matched ${(result as { matched_users: number }).matched_users} users, created ${(result as { matches_created: number }).matches_created} notifications` });
        break;

      case "digest":
        result = await handleDigest();
        logAuditAction({ adminEmail, action: "digest_sent", details: `Sent digests to ${(result as { digest_sent: number }).digest_sent} users` });
        break;

      case "rescore":
        result = await handleRescore();
        logAuditAction({ adminEmail, action: "cv_rescore_ran", details: `Re-scored ${(result as { rescored: number }).rescored}/${(result as { total: number }).total} CVs` });
        break;

      case "cleanup":
        result = await handleCleanup();
        logAuditAction({ adminEmail, action: "cleanup_ran", details: `Deleted ${(result as { deleted: number }).deleted} old records` });
        break;

      case "export":
        result = await handleExport();
        logAuditAction({ adminEmail, action: "data_exported", details: "Exported all data" });
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, action, ...(result as object) });
  } catch (err) {
    console.error(`Admin action error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
