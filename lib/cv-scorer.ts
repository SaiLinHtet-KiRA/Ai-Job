import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import resultEmailTemplate from "@/lib/score-email-template";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FROM = "easy2apply@easy2apply.work";

export interface CVScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
  cv_score_id: number | null;
}

const MOCK_RESULT: Omit<CVScoreResult, "cv_score_id"> = {
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
  summary:
    "Your CV is solid with good keyword coverage. Adding a LinkedIn profile and education details would improve your score further.",
};

export async function scoreCV({
  buffer,
  fileName,
  fileType,
  fileSize,
  email,
  ip,
}: {
  buffer: Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
  email: string;
  ip?: string;
}): Promise<CVScoreResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `scored/${timestamp}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("cvs")
    .upload(storagePath, buffer, {
      contentType: fileType,
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error("Failed to save file for scoring.");
  }

  let cvScoreId: number | null = null;

  const { data: inserted, error: dbError } = await supabase
    .from("cv_scores")
    .insert({
      ip_address: ip ?? "unknown",
      email: email || null,
      file_name: fileName,
      file_size_kb: Math.round(fileSize / 1024),
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
      await resend.emails
        .send({
          from: FROM,
          to: email,
          subject: `Your CV Score: ${MOCK_RESULT.score}/100`,
          html: resultEmailTemplate(email, MOCK_RESULT),
        })
        .catch((err) => console.error("Failed to send score email:", err));
    }
  }

  return {
    ...MOCK_RESULT,
    cv_score_id: cvScoreId,
  };
}
