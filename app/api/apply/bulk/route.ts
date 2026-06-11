import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { applicantTemplate, employerTemplate, logEmail } from "@/lib/email";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM = "easy2apply@easy2apply.work";

const DEMO_MODE = !resendApiKey;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userEmail = session.user.email ?? "";
    const userName = session.user.name ?? userEmail.split("@")[0];
    const supabase = getSupabaseAdmin();

    const { data: userCV, error: cvError } = await supabase
      .from("user_cvs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (cvError || !userCV) {
      return NextResponse.json({ error: "No CV found. Please upload your CV first." }, { status: 400 });
    }

    const cvUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${userCV.storage_path}`;

    const body = await req.json();
    const { applications, job_type, expected_salary } = body;

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json({ error: "No applications provided" }, { status: 400 });
    }

    const emailApplications = applications.filter((app: Record<string, unknown>) => app.apply_email);

    if (emailApplications.length === 0) {
      return NextResponse.json({ error: "No email-apply jobs selected" }, { status: 400 });
    }

    const results = {
      successful: 0,
      failed: 0,
      details: [] as { job_id: number; status: string; error?: string }[],
    };

    const appliedJobs: { title: string; company: string; email: string; location?: string }[] = [];

    for (const app of emailApplications) {
      try {
        const { data: appRecord, error: dbError } = await supabase
          .from("applications")
          .insert({
            user_id: userId,
            name: userName,
            email: userEmail,
            job_id: app.job_id,
            cv_url: cvUrl,
            cv_id: userCV.id,
            position: app.job_title || "",
            type: job_type || "full-time",
            salary: expected_salary || "",
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

        if (!DEMO_MODE && resend) {
          const sentAt = new Date().toISOString();
          const employerHtml = employerTemplate({
            name: userName,
            email: userEmail,
            position: app.job_title || "",
            type: job_type || "full-time",
            salary: expected_salary || "",
            resumeUrl: cvUrl,
            coverLetter: app.cover_letter || undefined,
            sentAt,
            job: {
              title: app.job_title || "",
              company: app.company || "",
              location: app.location || "",
              apply_email: app.apply_email || "",
            },
          });

          const subject = `New Application: ${app.job_title || "Job Application"} \u2014 ${userName}`;
          const { error: emailError } = await resend.emails.send({
            from: `easy2apply <${FROM}>`,
            to: app.apply_email,
            subject,
            html: employerHtml,
          });

          if (emailError) {
            console.error("Email error:", emailError);
            logEmail({ type: "application", to: app.apply_email, subject, status: "failed", error: emailError.message, userId, metadata: { job_id: app.job_id } });
            await supabase
              .from("applications")
              .update({ status: "failed" })
              .eq("id", appRecord.id);

            results.failed++;
            results.details.push({ job_id: app.job_id, status: "failed", error: emailError.message });
            continue;
          }

          logEmail({ type: "application", to: app.apply_email, subject, status: "sent", userId, metadata: { job_id: app.job_id } });
        } else if (DEMO_MODE) {
          const subject = `New Application: ${app.job_title || "Job Application"} \u2014 ${userName}`;
          logEmail({ type: "application", to: app.apply_email, subject, status: "pending", userId, metadata: { job_id: app.job_id } });
        }

        await supabase.from("applications_sent").insert({
          user_id: userId,
          job_id: app.job_id,
          method: "email",
          sent_to: app.apply_email,
          status: DEMO_MODE ? "mock_sent" : "sent",
        });

        results.successful++;
        results.details.push({ job_id: app.job_id, status: "success" });

        appliedJobs.push({
          title: app.job_title || "",
          company: app.company || "",
          email: app.apply_email || "",
        });
      } catch (error) {
        console.error("Application error:", error);
        results.failed++;
        results.details.push({ job_id: app.job_id, status: "failed", error: "Unexpected error" });
      }
    }

    // Send confirmation email to user with list of applied jobs
    if (!DEMO_MODE && resend && appliedJobs.length > 0 && userEmail) {
      const position = appliedJobs[0]?.title || "various positions";

      const html = applicantTemplate({
        name: userName,
        position,
        jobs: appliedJobs.map((j) => ({
          id: 0,
          title: j.title,
          company: j.company,
          apply_email: j.email,
          location: j.location || "",
          job_type: job_type || "full-time",
          salary_range: expected_salary || "",
          description: "",
        })),
      });

      const summarySubject = `Applications Sent \u2014 ${appliedJobs.length} job${appliedJobs.length !== 1 ? "s" : ""}`;

      await resend.emails
        .send({
          from: FROM,
          to: userEmail,
          subject: summarySubject,
          html,
        })
        .then(() => {
          logEmail({ type: "application_summary", to: userEmail, subject: summarySubject, status: "sent", userId, metadata: { job_count: appliedJobs.length } });
        })
        .catch((err) => {
          console.error("Failed to send user confirmation email:", err);
          logEmail({ type: "application_summary", to: userEmail, subject: summarySubject, status: "failed", error: String(err), userId, metadata: { job_count: appliedJobs.length } });
        });
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
