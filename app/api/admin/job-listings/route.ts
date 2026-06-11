import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated, getSessionEmail } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { jobListingCreateSchema, formatZodError } from "@/lib/validations";
import { incrementLocationJobsSize, incrementTitleJobsSize } from "@/lib/location";
import { logAuditAction } from "@/lib/audit";

/**
 * List all job listings (admin)
 * @description Supports page and limit query params for pagination.
 * @tags ["Admin - Job Listings"]
 */
export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-job-listings:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();
    const { data, error, count } = await supabase
      .from("job_listings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * Create a new job listing
 * @description Creates a job listing with automatic expires_at calculation from expires_in_days.
 * @tags ["Admin - Job Listings"]
 */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-job-listings:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = jobListingCreateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed) }, { status: 400 });
    }

    const { expires_in_days, ...rest } = parsed.data;
    const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("job_listings")
      .insert({ ...rest, expires_at: expiresAt })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    incrementLocationJobsSize(rest.location).catch((err) =>
      console.error("Failed to increment location jobs_size:", err)
    );
    incrementTitleJobsSize(rest.title).catch((err) =>
      console.error("Failed to increment title jobs_size:", err)
    );

    const adminEmail = (await getSessionEmail()) ?? "unknown";
    logAuditAction({
      adminEmail,
      action: "job_listing_created",
      targetJobId: data.id,
      details: `Created job listing "${rest.title}" at ${rest.company || "Unknown"}`,
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * Delete a job listing
 * @description Deletes a job listing by id query parameter.
 * @tags ["Admin - Job Listings"]
 */
export async function DELETE(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-job-listings:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("job_listings").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminEmail = (await getSessionEmail()) ?? "unknown";
    logAuditAction({
      adminEmail,
      action: "job_listing_deleted",
      targetJobId: parseInt(id, 10),
      details: `Deleted job listing #${id}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
