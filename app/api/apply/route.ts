import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendApplicationEmails } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { applySchema, formatZodError } from "@/lib/validations";

/**
 * Submit a job application
 * @description Accepts multipart/form-data with name, email, position, type, salary, and resume file. Uploads the resume to Supabase Storage and stores the application.
 * @tags ["Apply"]
 */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(`apply:${getClientIp(req)}`, { limit: 5, duration: 60 });
    if (limited) return limited;
    const formData = await req.formData();

    const parsed = applySchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      position: formData.get("position"),
      type: formData.get("type"),
      salary: formData.get("salary"),
      resume: formData.get("resume"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { name, email, position, type, salary, resume: resumeFile } = parsed.data;

    const filePath = `${Date.now()}_${resumeFile.name}`;
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType: resumeFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", JSON.stringify(uploadError, null, 2));
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload resume." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("applications").insert({
      name,
      email,
      position,
      type,
      salary,
      cv_url: publicUrl,
    });

    if (insertError) {
      console.error("Insert error:", JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { error: insertError.message || "Failed to save application." },
        { status: 500 },
      );
    }

    const { data: jobs } = await supabase
      .from("job_listings")
      .select("id, title, company, location, job_type, salary_range, description, apply_email")
      .ilike("title", `%${position}%`);

    if (jobs?.length) {
      sendApplicationEmails({
        name,
        email,
        position,
        type,
        salary,
        resumeUrl: publicUrl,
        jobs,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
