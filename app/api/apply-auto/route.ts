import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/apply-auto — send application email for an approved match
// Mock now, Resend later
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { match_id, user_id } = body;

  if (!match_id || !user_id) {
    return NextResponse.json(
      { error: "match_id and user_id are required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  // Get the match with job details
  const { data: match, error: matchError } = await supabase
    .from("daily_matches")
    .select("*, job_listings(*)")
    .eq("id", match_id)
    .eq("user_id", user_id)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }

  if (match.status !== "approved") {
    return NextResponse.json(
      { error: "Match must be approved before applying." },
      { status: 400 },
    );
  }

  const job = match.job_listings;
  if (!job?.apply_email) {
    return NextResponse.json(
      { error: "This job doesn't accept email applications." },
      { status: 400 },
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("email")
    .eq("user_id", user_id)
    .single();

  const userEmail = profile?.email ?? "user@example.com";

  // ── MOCK MODE: Simulate sending email ──
  // In production: use Resend to send the application email
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: `${userEmail} via easy2apply <apply@easy2apply.com>`,
  //   to: job.apply_email,
  //   cc: userEmail,
  //   subject: `Application: ${job.title} — ${userEmail}`,
  //   text: match.cover_letter,
  //   attachments: [{ filename: 'CV.pdf', content: cvBuffer }],
  // });

  console.log(`[mock] Would send application email to ${job.apply_email} for ${job.title}`);
  console.log(`[mock] CC: ${userEmail}`);
  console.log(`[mock] Cover letter: ${match.cover_letter?.slice(0, 100)}...`);

  // Record the application
  const { error: insertError } = await supabase.from("applications_sent").insert({
    user_id,
    match_id: match.id,
    job_id: job.id,
    method: "email",
    sent_to: job.apply_email,
    status: "mock_sent",
  });

  if (insertError) {
    console.error("Failed to record application:", insertError);
  }

  // Update match status to "applied"
  await supabase
    .from("daily_matches")
    .update({ status: "applied", acted_at: new Date().toISOString() })
    .eq("id", match_id);

  return NextResponse.json({
    success: true,
    message: `Application sent to ${job.apply_email} for ${job.title} at ${job.company}`,
    method: "email",
    mock: true,
  });
}
