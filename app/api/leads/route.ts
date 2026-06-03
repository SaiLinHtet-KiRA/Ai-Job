import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 email submits per hour per IP
    const ip = getClientIp(req);
    const limited = await rateLimit(`leads:${ip}`, { limit: 5, duration: 3600 });
    if (limited) return limited;

    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();

    // Validate email
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const cvScoreId = body.cv_score_id ?? null;
    const source = body.source ?? "cv_score";

    const supabase = getSupabaseAdmin();

    // Upsert: if email already exists, update the cv_score_id link
    const { error } = await supabase.from("leads").upsert(
      {
        email,
        ip_address: ip,
        cv_score_id: cvScoreId,
        source,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("Failed to save lead:", error);
      return NextResponse.json(
        { error: "Could not save your email. Please try again." },
        { status: 500 },
      );
    }

    // Also update the cv_scores row with the email if we have a cv_score_id
    if (cvScoreId) {
      await supabase
        .from("cv_scores")
        .update({ email })
        .eq("id", cvScoreId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
