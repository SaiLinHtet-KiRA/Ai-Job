import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { cvScoresQuerySchema, formatZodError } from "@/lib/validations";

/**
 * List CV scores with pagination
 * @tags ["Admin - CV Scores"]
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = cvScoresQuerySchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { page, pageSize } = parsed.data;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseAdmin();

    const { data: scores, error, count } = await supabase
      .from("cv_scores")
      .select("*", { count: "exact", head: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Fetch cv_scores error:", error);
      return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      scores: scores || [],
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
