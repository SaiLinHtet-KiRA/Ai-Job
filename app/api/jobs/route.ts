import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`jobs:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("jobs")
      .select("id, title, title_id, company, email, location, type, salary, description, image_url, created_at")
      .order("created_at", { ascending: false });

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
