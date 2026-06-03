import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import resultEmailTemplate from "@/lib/score-email-template";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const FROM = "easy2apply@easy2apply.work";

const MOCK_RESULT = {
  score: 78,
  strengths: [
    "Strong keyword coverage: 12 relevant keywords found",
    "Good length: 350 words",
    "Contact information included",
    "Uses action verbs and achievements",
  ],
  weaknesses: [
    "No LinkedIn profile found — consider adding it",
    "No education section found — include your academic background",
  ],
  keywords_missing: ["Kubernetes", "GraphQL", "AWS", "Docker", "MongoDB"],
  summary: "Your CV is solid with good keyword coverage. Adding a LinkedIn profile and education details would improve your score further.",
};

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limited = await rateLimit(`score:${ip}`, { limit: 10, duration: 3600 });
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and Word files are supported." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = Date.now();
    const storagePath = `scored/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
    }

    let cvScoreId: number | null = null;
    const { data: inserted, error: dbError } = await supabase
      .from("cv_scores")
      .insert({
        ip_address: ip,
        email: email || null,
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        score: MOCK_RESULT.score,
        strengths: MOCK_RESULT.strengths,
        weaknesses: MOCK_RESULT.weaknesses,
        keywords_missing: MOCK_RESULT.keywords_missing,
        summary: MOCK_RESULT.summary,
      })
      .select("id")
      .maybeSingle();

    if (dbError) {
      console.error("cv_scores insert error:", dbError);
    } else if (inserted) {
      cvScoreId = inserted.id;
    }

    if (email) {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: `Your CV Score: ${MOCK_RESULT.score}/100`,
          html: resultEmailTemplate(email, MOCK_RESULT),
        }).catch((err) => console.error("Failed to send score email:", err));
      }
    }

    return NextResponse.json({
      ...MOCK_RESULT,
      cv_score_id: cvScoreId,
    });
  } catch (err) {
    console.error("Score API error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
