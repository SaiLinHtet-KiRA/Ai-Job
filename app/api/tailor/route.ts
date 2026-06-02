import { NextRequest, NextResponse } from "next/server";

// POST /api/tailor — generate a tailored CV summary and cover letter for a specific job
// Mock now, Claude later
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cv_text, job_title, company, required_skills, user_skills } = body;

  if (!job_title || !company) {
    return NextResponse.json(
      { error: "job_title and company are required." },
      { status: 400 },
    );
  }

  // Simulate AI processing time
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const skills = user_skills ?? ["JavaScript", "React", "TypeScript"];
  const reqSkills = required_skills ?? ["React", "Node.js", "TypeScript"];
  const matchedSkills = skills.filter((s: string) =>
    reqSkills.some((rs: string) => rs.toLowerCase() === s.toLowerCase()),
  );

  // Mock tailored CV summary
  const tailored_summary = `Results-driven developer with proven expertise in ${matchedSkills.slice(0, 3).join(", ")}. Seeking to leverage ${matchedSkills.length}+ relevant skills at ${company} as ${job_title}. Track record of delivering high-quality solutions in fast-paced environments with focus on ${reqSkills[0]} and ${reqSkills[1] ?? "modern tooling"}.`;

  // Mock cover letter
  const cover_letter = `Dear ${company} Hiring Team,

I'm excited to apply for the ${job_title} position. With hands-on experience in ${matchedSkills.slice(0, 3).join(", ")}, I'm confident I can make an immediate impact on your team.

In my recent role, I've:
• Built and shipped production applications using ${matchedSkills[0] ?? "modern frameworks"}
• Collaborated with cross-functional teams to deliver features on tight deadlines
• Maintained high code quality through testing and code review practices

I'm particularly drawn to ${company} because of the opportunity to work with ${reqSkills.slice(0, 2).join(" and ")} at scale. I'm eager to bring my experience and learn ${reqSkills.filter((s: string) => !matchedSkills.includes(s)).slice(0, 2).join(" and ") || "new technologies"} in the process.

I'd welcome the chance to discuss how my background aligns with your team's needs.

Best regards`;

  // Mock key talking points
  const talking_points = [
    `Highlight your ${matchedSkills[0]} experience — it's their top requirement`,
    `Mention a specific project where you used ${matchedSkills[1] ?? matchedSkills[0]}`,
    reqSkills.filter((s: string) => !matchedSkills.includes(s)).length > 0
      ? `Be upfront about learning ${reqSkills.filter((s: string) => !matchedSkills.includes(s))[0]} — show enthusiasm`
      : "You match all their requirements — lead with confidence",
    `Research ${company}'s recent news to personalize the conversation`,
  ];

  return NextResponse.json({
    tailored_summary,
    cover_letter,
    talking_points,
    matched_skills: matchedSkills,
    gaps: reqSkills.filter((s: string) => !matchedSkills.includes(s)),
  });
}
