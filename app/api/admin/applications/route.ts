import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { applicationsQuerySchema, formatZodError } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = applicationsQuerySchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { page, limit } = parsed.data;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getSupabaseAdmin();

    const { data: applications, error, count } = await supabase
      .from("applications")
      .select("id, name, email, position, type, salary, cv_url, created_at", { count: "exact", head: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Fetch applications error:", error);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: applications || [],
      page,
      limit,
      total,
      totalPages,
    });

  } catch (error) {
    console.error("Admin applications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
