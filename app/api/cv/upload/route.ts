import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF text (dynamic import for ES module compatibility)
    let parsedText = "";
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as { default?: (buf: Buffer) => Promise<{ text: string }> }).default || pdfParseModule as unknown as (buf: Buffer) => Promise<{ text: string }>;
      const parsed = await pdfParse(buffer);
      parsedText = parsed.text || "";
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      // Continue even if parsing fails - we still store the file
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from("cvs").getPublicUrl(fileName);

    // Delete old CV if exists (single CV per user)
    const { data: oldCvs } = await supabase
      .from("user_cvs")
      .select("id, storage_path")
      .eq("user_id", userId);

    if (oldCvs && oldCvs.length > 0) {
      // Delete old file from storage
      for (const oldCv of oldCvs) {
        await supabase.storage.from("cvs").remove([oldCv.storage_path]);
      }
      // Delete old records
      await supabase.from("user_cvs").delete().eq("user_id", userId);
    }

    // Insert new CV record
    const { data: cvRecord, error: dbError } = await supabase
      .from("user_cvs")
      .insert({
        user_id: userId,
        storage_path: fileName,
        file_name: file.name,
        parsed_text: parsedText,
        structured_data: {}, // Will be populated by LLM later
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save CV record" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cv: {
        id: cvRecord.id,
        fileName: file.name,
        url: publicUrl,
        parsedText: parsedText.substring(0, 500) + (parsedText.length > 500 ? "..." : ""),
      },
    });

  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get user's CV
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { data: cv, error } = await supabase
      .from("user_cvs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch CV" }, { status: 500 });
    }

    if (!cv) {
      return NextResponse.json({ cv: null });
    }

    const { data: { publicUrl } } = supabase.storage.from("cvs").getPublicUrl(cv.storage_path);

    return NextResponse.json({
      cv: {
        id: cv.id,
        fileName: cv.file_name,
        url: publicUrl,
        uploadedAt: cv.uploaded_at,
        parsedText: cv.parsed_text?.substring(0, 500) + (cv.parsed_text?.length > 500 ? "..." : ""),
      },
    });

  } catch (error) {
    console.error("CV fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
