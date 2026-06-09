import { z } from "zod/v4";
import { generateObject, zodSchema } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import resultEmailTemplate from "@/lib/score-email-template";
import { extractCVText } from "@/lib/extract-cv-text";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FROM = "easy2apply@easy2apply.work";

const scoreSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Overall score from 0 to 100"),
  strengths: z
    .array(z.string())
    .describe("Concise positive observations"),
  weaknesses: z
    .array(z.string())
    .describe("Concise areas for improvement"),
  keywords_missing: z
    .array(z.string())
    .describe("Important missing keywords or skills"),
  summary: z
    .string()
    .describe("Brief summary of the evaluation"),
});

export interface CVScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
  cv_score_id: number | null;
}

const SCORING_PROMPT = `Analyze the provided content and evaluate its quality.

Return ONLY a valid JSON object with the following structure:

{
"score": <integer between 0 and 100>,
"strengths": ["strength 1", "strength 2"],
"weaknesses": ["weakness 1", "weakness 2"],
"keywords_missing": ["keyword 1", "keyword 2"],
"summary": "A brief summary of the evaluation."
}

Rules:

* score must be an integer from 0 to 100.
* strengths must contain concise positive observations.
* weaknesses must contain concise areas for improvement.
* keywords_missing must contain important missing keywords or skills.
* summary must be 1-3 sentences.
* Return empty arrays when no items are found.
* Do not include markdown, explanations, or any text outside the JSON object.`;

async function scoreWithGemini(cvText: string): Promise<Omit<CVScoreResult, "cv_score_id">> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: zodSchema(scoreSchema),
    system: SCORING_PROMPT,
    prompt: cvText.slice(0, 12000),
    temperature: 0.3,
  });

  return object;
}

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

  let cvText = "";
  try {
    cvText = await extractCVText({ buffer, fileType });
  } catch (err) {
    console.error("CV text extraction error:", err);
  }

  let scored: Omit<CVScoreResult, "cv_score_id">;
  try {
    scored = await scoreWithGemini(cvText);
  } catch (err) {
    console.error("Gemini scoring error:", err);
    throw new Error("Failed to score CV.");
  }

  let cvScoreId: number | null = null;

  const { data: inserted, error: dbError } = await supabase
    .from("cv_scores")
    .insert({
      ip_address: ip ?? "unknown",
      email: email || null,
      file_name: fileName,
      file_size_kb: Math.round(fileSize / 1024),
      score: scored.score,
      strengths: scored.strengths,
      weaknesses: scored.weaknesses,
      keywords_missing: scored.keywords_missing,
      summary: scored.summary,
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
          subject: `Your CV Score: ${scored.score}/100`,
          html: resultEmailTemplate(email, scored),
        })
        .catch((err) => console.error("Failed to send score email:", err));
    }
  }

  return {
    ...scored,
    cv_score_id: cvScoreId,
  };
}
