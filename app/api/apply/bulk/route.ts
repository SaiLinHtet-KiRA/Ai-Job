import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Demo mode - no actual emails sent
const DEMO_MODE = !resendApiKey;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const supabase = getSupabaseAdmin();

    // Get user's CV
    const { data: userCV, error: cvError } = await supabase
      .from("user_cvs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (cvError || !userCV) {
      return NextResponse.json({ error: "No CV found. Please upload your CV first." }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { applications } = body;

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json({ error: "No applications provided" }, { status: 400 });
    }

    // Filter to only email-apply jobs
    const emailApplications = applications.filter((app: any) => app.apply_email);

    if (emailApplications.length === 0) {
      return NextResponse.json({ error: "No email-apply jobs selected" }, { status: 400 });
    }

    const results = {
      successful: 0,
      failed: 0,
      details: [] as any[],
    };

    // Process each application
    for (const app of emailApplications) {
      try {
        // Record application in database
        const { data: appRecord, error: dbError } = await supabase
          .from("applications")
          .insert({
            user_id: userId,
            job_id: app.job_id,
            cv_id: userCV.id,
            cover_letter: app.cover_letter,
            method: "email",
            status: DEMO_MODE ? "pending" : "sent",
            sent_at: DEMO_MODE ? null : new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          console.error("Database error:", dbError);
          results.failed++;
          results.details.push({ job_id: app.job_id, status: "failed", error: "Database error" });
          continue;
        }

        // Send email via Resend (if not in demo mode)
        if (!DEMO_MODE && resend) {
          const { error: emailError } = await resend.emails.send({
            from: "easy2apply <applications@easy2apply.com>",
            to: app.apply_email,
            subject: `Application: ${app.job_title || "Job Application"}`,
            text: app.cover_letter,
            attachments: userCV.storage_path ? [
              {
                filename: userCV.file_name,
                path: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${userCV.storage_path}`,
              },
            ] : undefined,
          });

          if (emailError) {
            console.error("Email error:", emailError);
            // Update application status to failed
            await supabase
              .from("applications")
              .update({ status: "failed" })
              .eq("id", appRecord.id);
            
            results.failed++;
            results.details.push({ job_id: app.job_id, status: "failed", error: emailError.message });
            continue;
          }
        }

        // Update match status to applied
        await supabase
          .from("daily_matches")
          .update({ status: "applied" })
          .eq("id", app.match_id);

        results.successful++;
        results.details.push({ job_id: app.job_id, status: "success" });

      } catch (error) {
        console.error("Application error:", error);
        results.failed++;
        results.details.push({ job_id: app.job_id, status: "failed", error: "Unexpected error" });
      }
    }

    return NextResponse.json({
      success: true,
      demo: DEMO_MODE,
      successful: results.successful,
      failed: results.failed,
      details: results.details,
    });

  } catch (error) {
    console.error("Bulk apply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
