import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendApplicationEmails } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const position = formData.get("position") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const resumeFile = formData.get("resume") as File;

    if (!name || !email || !position || !type || !salary || !resumeFile) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

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
      resume_url: publicUrl,
    });

    if (insertError) {
      console.error("Insert error:", JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { error: insertError.message || "Failed to save application." },
        { status: 500 },
      );
    }

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, company, email, location, type, salary, description")
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
