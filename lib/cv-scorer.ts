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
  strengths: z.array(z.string()).describe("Concise positive observations"),
  weaknesses: z.array(z.string()).describe("Concise areas for improvement"),
  keywords_missing: z
    .array(z.string())
    .describe("Important missing keywords or skills"),
  skills: z
    .array(z.string())
    .describe("Technical, professional, and domain skills found in the resume"),
  recommended_job_titles: z
    .array(z.string())
    .describe("Job titles that best match the candidate's experience and skills"),
  summary: z.string().describe("Brief summary of the evaluation"),
});

export interface CVScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  skills: string[];
  recommended_job_titles: string[];
  summary: string;
  cv_score_id: number | null;
}

const SCORING_PROMPT = `Analyze the uploaded resume/CV and return ONLY a valid JSON object.

Extract and generate:

* email: candidate email address
* file_name: uploaded file name
* file_size_kb: uploaded file size in KB
* score: ATS score from 0-100
* skills: array of 5-10 inferred core skills that best represent the candidate's expertise and strengths (not a dump of all technologies, tools, or keywords found in the resume)
* recommended_job_titles: array of 3-8 job titles that best match the candidate's experience, skills, and seniority level
* strengths: exactly 3 specific strengths that improve ATS performance
* weaknesses: exactly 3 specific weaknesses that reduce ATS performance
* keywords_missing: relevant ATS keywords missing for the candidate's likely target role(s)
* summary: concise 2-4 sentence professional summary

Return JSON in this exact format:

{
"email": "",
"file_name": "",
"file_size_kb": 0,
"score": 0,
"skills": [],
"recommended_job_titles": [],
"strengths": [],
"weaknesses": [],
"keywords_missing": [],
"summary": ""
}

Rules:

1. Return ONLY valid JSON.
2. Do not return markdown, explanations, or additional text.
3. skills must contain unique values only.
4. skills should represent high-level core competencies (e.g., "Project Management", "Data Analysis", "Business Development", "Software Engineering"), not individual tools unless they are central to the candidate's expertise.
5. recommended_job_titles must contain realistic roles matching the candidate's experience level and background.
6. strengths must contain exactly 3 items.
7. weaknesses must contain exactly 3 items.
8. keywords_missing should contain realistic ATS keywords relevant to the candidate's field and career level.
9. Base the ATS score on resume structure, keyword relevance, skills alignment, experience quality, achievements, education, and ATS compatibility.
10. Summary must be professional, objective, and written in third person.
11. If a value cannot be determined, use an empty string or empty array.
12. Ensure all arrays contain plain strings only.
13. Infer the candidate's most likely career track and target role before generating skills, recommended_job_titles, and keywords_missing.
14. Prioritize business capabilities, domain expertise, and professional competencies over software tools when generating skills.

`;

async function scoreWithGemini(
  cvText: string,
): Promise<Omit<CVScoreResult, "cv_score_id">> {
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
      skills: scored.skills,
      recommended_job_titles: scored.recommended_job_titles,
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
