import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { emailsQuerySchema, formatZodError } from "@/lib/validations";

/**
 * List email logs
 * @description Returns paginated email log entries with optional ?type and ?status filters. Tracks welcome, verification, application, and score emails.
 * @tags ["Admin - Emails"]
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = emailsQuerySchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { page, pageSize, type, status: statusFilter } = parsed.data;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("email_logs")
      .select("*", { count: "exact", head: false })
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data: emails, error, count } = await query.range(from, to);

    if (error) {
      console.error("Fetch email_logs error:", error);
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      emails: emails || [],
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
