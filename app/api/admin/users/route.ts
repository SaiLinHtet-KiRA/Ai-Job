import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "10", 10) || 10));
    const status = url.searchParams.get("status") || undefined;

    const supabase = getSupabaseAdmin();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: profiles, count, error } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    const users = (profiles ?? []).map((p) => ({
      id: p.user_id,
      email: p.email,
      email_verified: true,
      created_at: p.created_at,
      last_sign_in: p.last_scored_at,
      banned: p.status === "banned",
      profile: p,
    }));

    return NextResponse.json({ users, page, pageSize, total, totalPages });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
