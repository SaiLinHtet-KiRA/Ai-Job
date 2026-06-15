import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

/**
 * Get user counts
 * @description Returns total, active, and banned user counts.
 * @tags ["Admin - Users"]
 */
export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const [totalResult, activeResult, bannedResult] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "banned"),
    ]);

    return NextResponse.json({
      total: totalResult.count ?? 0,
      activeCount: activeResult.count ?? 0,
      bannedCount: bannedResult.count ?? 0,
    });
  } catch (err) {
    console.error("Admin users stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
