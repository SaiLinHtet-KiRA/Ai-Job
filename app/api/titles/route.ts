import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`titles:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("titles")
      .select("id, name")
      .order("name", { ascending: true });

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
