import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  // .docx
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function buildPrompt(cvText: string): string {
  return `You are an expert ATS (Applicant Tracking System) analyst. Analyze the following CV text and return a JSON object with exactly this structure:

{
  "score": <number 0-100>,
  "strengths": [<exactly 3 strings>],
  "weaknesses": [<exactly 3 strings>],
  "keywords_missing": [<up to 8 strings — real skills/tools/qualifications ATS systems look for>],
  "summary": "<2-3 sentence overall assessment>"
}

Scoring criteria:
- Contact info present and complete (name, email, phone, LinkedIn)
- Clear section headings (Experience, Education, Skills, etc.)
- Quantified achievements with metrics
- Relevant keywords for the apparent target role
- Proper formatting (no tables, columns, or graphics that ATS can't parse)
- Appropriate length (1-2 pages)
- No typos or grammatical errors
- Action verbs used consistently
- Dates and durations clearly stated
- Skills section with specific, searchable terms

Be specific and actionable. Don't give generic advice — reference actual content from the CV.

Return ONLY valid JSON. No markdown, no explanation, no wrapping.

CV TEXT:
${cvText.slice(0, 8000)}`;
}

type ScoreResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
};

function validateResult(data: unknown): ScoreResult | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (typeof d.score !== "number" || d.score < 0 || d.score > 100) return null;
  if (!Array.isArray(d.strengths) || d.strengths.length === 0) return null;
  if (!Array.isArray(d.weaknesses) || d.weaknesses.length === 0) return null;
  if (!Array.isArray(d.keywords_missing)) return null;
  if (typeof d.summary !== "string" || d.summary.length === 0) return null;

  return {
    score: Math.round(d.score),
    strengths: d.strengths.slice(0, 3).map(String),
    weaknesses: d.weaknesses.slice(0, 3).map(String),
    keywords_missing: d.keywords_missing.slice(0, 8).map(String),
    summary: d.summary,
  };
}

function generateMockResult(cvText: string): ScoreResult {
  const text = cvText.toLowerCase();

  // Derive a semi-deterministic score from text characteristics
  let score = 45;
  if (text.includes("experience")) score += 8;
  if (text.includes("education")) score += 6;
  if (text.includes("skills")) score += 5;
  if (/\d+\s*(years?|yrs?)/.test(text)) score += 7;
  if (text.includes("linkedin")) score += 3;
  if (text.includes("@") && text.includes(".")) score += 3;
  if (/\d{3}[\s-]?\d{3,4}[\s-]?\d{4}/.test(text)) score += 3;
  if (text.includes("project")) score += 4;
  if (text.includes("achieved") || text.includes("increased") || text.includes("reduced")) score += 6;
  // Clamp
  score = Math.min(95, Math.max(25, score + Math.floor(Math.random() * 10) - 5));

  const allStrengths = [
    "Clear section structure with distinct headings for Experience, Education, and Skills",
    "Contact information is complete — includes email, phone, and location",
    "Good use of action verbs to describe responsibilities and achievements",
    "Relevant work experience is listed in reverse chronological order",
    "Skills section includes specific, searchable technical terms",
    "Education section includes degree, institution, and graduation date",
  ];

  const allWeaknesses = [
    "Missing quantified achievements — add metrics like percentages, revenue, or team sizes",
    "No LinkedIn URL included — most recruiters check LinkedIn before calling",
    "Job descriptions are too generic — tailor bullet points to target roles",
    "CV may be too long for ATS — consider condensing to 1-2 pages",
    "Missing a professional summary at the top to hook the reader",
    "Some bullet points start with weak phrases instead of strong action verbs",
  ];

  const allKeywords = [
    "project management", "data analysis", "stakeholder engagement",
    "agile methodology", "cross-functional collaboration", "KPI tracking",
    "budget management", "process improvement", "team leadership",
    "strategic planning", "CRM software", "A/B testing",
  ];

  // Pick 3 strengths and 3 weaknesses (shuffled)
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  const strengths = shuffle(allStrengths).slice(0, 3);
  const weaknesses = shuffle(allWeaknesses).slice(0, 3);
  const keywords_missing = shuffle(allKeywords).slice(0, Math.floor(Math.random() * 4) + 4);

  const summaryOptions = [
    `This CV scores ${score}/100 on ATS compatibility. The structure is solid but there are key improvements that could significantly boost your pass rate. Focus on adding quantified achievements and ensuring your skills section includes industry-standard keywords.`,
    `With a score of ${score}/100, this CV has a reasonable foundation but needs targeted improvements to consistently pass ATS filters. The main gaps are in keyword optimization and quantifiable results — addressing these could push your score above 75.`,
    `Your CV achieves ${score}/100 on our ATS analysis. While the overall layout works well for human readers, ATS systems need more explicit keyword matches and structured data to rank it highly. The fixes below are ordered by impact.`,
  ];

  return {
    score,
    strengths,
    weaknesses,
    keywords_missing,
    summary: summaryOptions[Math.floor(Math.random() * summaryOptions.length)],
  };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 requests per hour per IP
    const ip = getClientIp(req);
    const limited = await rateLimit(`cv-score:${ip}`, { limit: 3, duration: 3600 });
    if (limited) return limited;

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a PDF or Word (.docx) file." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large (max 5 MB)." },
        { status: 400 },
      );
    }

    // Extract text
    let cvText: string;
    try {
      cvText = await extractText(file);
    } catch (err) {
      console.error("Text extraction failed:", err);
      return NextResponse.json(
        { error: "Could not read your file. Please try a different PDF or Word document." },
        { status: 422 },
      );
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from your file. It may be image-based or empty." },
        { status: 422 },
      );
    }

    // AI scoring (or mock fallback)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let result: ScoreResult;

    if (!apiKey) {
      // ── Mock mode ── returns realistic fake results for demo/testing
      console.log("[mock] ANTHROPIC_API_KEY not set — returning mock score");
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      result = generateMockResult(cvText);
    } else {
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: buildPrompt(cvText),
          },
        ],
      });

      const responseText =
        message.content[0]?.type === "text" ? message.content[0].text : "";

      let parsed: unknown;
      try {
        const cleaned = responseText
          .replace(/^```json?\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse AI response:", responseText);
        return NextResponse.json(
          { error: "AI returned an unexpected response. Please try again." },
          { status: 502 },
        );
      }

      const validated = validateResult(parsed);
      if (!validated) {
        console.error("Invalid AI result structure:", parsed);
        return NextResponse.json(
          { error: "AI returned an unexpected response. Please try again." },
          { status: 502 },
        );
      }
      result = validated;
    }

    // Save to database (best-effort, don't fail the request)
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("cv_scores").insert({
        ip_address: ip,
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        score: result.score,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        keywords_missing: result.keywords_missing,
        summary: result.summary,
      });
    } catch (dbErr) {
      console.error("Failed to save score to database:", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Score route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
