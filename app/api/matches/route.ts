import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/matches — get current user's pending matches
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = session.user.id;
  const supabase = getSupabaseAdmin();
  const status = req.nextUrl.searchParams.get("status") ?? "pending";

  const { data, error } = await supabase
    .from("daily_matches")
    .select("*, job_listings(*)")
    .eq("user_id", userId)
    .eq("status", status)
    .order("match_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// PATCH /api/matches — approve or skip a match
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { match_id, action } = body;

  if (!match_id || !["approved", "skipped"].includes(action)) {
    return NextResponse.json(
      { error: "match_id and action (approved|skipped) are required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("daily_matches")
    .update({ status: action, acted_at: new Date().toISOString() })
    .eq("id", match_id)
    .select("*, job_listings(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If approved and job has apply_email, trigger auto-apply
  if (action === "approved" && data?.job_listings?.apply_email) {
    // TODO: Send application email via Resend when configured
    // For now, log and create an applications_sent record
    await supabase.from("applications_sent").insert({
      user_id: data.user_id,
      match_id: data.id,
      job_id: data.job_id,
      method: "email",
      sent_to: data.job_listings.apply_email,
      status: "mock_sent",
    });
  }

  return NextResponse.json({ success: true, match: data });
}
