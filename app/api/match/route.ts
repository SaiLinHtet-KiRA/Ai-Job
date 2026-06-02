import { NextRequest, NextResponse } from "next/server";

type MockJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  match_score: number;
  required_skills: string[];
  missing_skills: string[];
  posted_days_ago: number;
};

const MOCK_COMPANIES = [
  "TechCorp", "StartupHub", "CloudBase", "DataFlow", "Innovate Inc.",
  "NextGen Labs", "DevStack", "CodeWave", "DigitalPath", "ScaleUp",
  "ByteShift", "Appify", "ZenDev", "ClearCode", "PulseTech",
];

const MOCK_LOCATIONS = [
  "Remote", "Singapore", "Bangkok", "London (Remote)",
  "San Francisco (Hybrid)", "Berlin", "Tokyo", "Sydney (Remote)",
  "New York", "Dubai",
];

const ROLE_SKILLS: Record<string, string[]> = {
  frontend: ["React", "TypeScript", "CSS", "Next.js", "Tailwind", "JavaScript", "HTML", "Git", "Testing", "Redux"],
  backend: ["Node.js", "Python", "PostgreSQL", "REST API", "Docker", "AWS", "TypeScript", "Redis", "GraphQL", "CI/CD"],
  fullstack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Git", "REST API", "Next.js", "Testing"],
  data: ["Python", "SQL", "Pandas", "Tableau", "Excel", "Statistics", "Machine Learning", "Power BI", "R", "ETL"],
  design: ["Figma", "User Research", "Prototyping", "Wireframing", "Typography", "Design Systems", "HTML/CSS", "Accessibility", "Motion Design", "Sketch"],
  devops: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Monitoring", "Ansible", "Python", "Networking"],
  mobile: ["React Native", "Swift", "Kotlin", "Flutter", "Firebase", "REST API", "Git", "UI/UX", "Testing", "TypeScript"],
  product: ["Roadmapping", "User Stories", "Analytics", "A/B Testing", "Stakeholder Management", "SQL", "Agile", "Wireframing", "Prioritization", "Communication"],
};

function detectRole(cvText: string): string {
  const text = cvText.toLowerCase();
  if (text.includes("react") || text.includes("frontend") || text.includes("css") || text.includes("tailwind")) return "frontend";
  if (text.includes("python") && (text.includes("data") || text.includes("pandas") || text.includes("sql"))) return "data";
  if (text.includes("devops") || text.includes("kubernetes") || text.includes("terraform")) return "devops";
  if (text.includes("figma") || text.includes("ux") || text.includes("design")) return "design";
  if (text.includes("react native") || text.includes("flutter") || text.includes("swift") || text.includes("mobile")) return "mobile";
  if (text.includes("product") && text.includes("manager")) return "product";
  if (text.includes("node") || text.includes("express") || text.includes("api")) return "backend";
  if (text.includes("fullstack") || text.includes("full stack") || text.includes("full-stack")) return "fullstack";
  return "fullstack";
}

function extractSkillsFromCV(cvText: string, roleSkills: string[]): string[] {
  const text = cvText.toLowerCase();
  return roleSkills.filter((skill) => text.includes(skill.toLowerCase()));
}

function generateMockJobs(cvText: string): MockJob[] {
  const role = detectRole(cvText);
  const roleSkills = ROLE_SKILLS[role] || ROLE_SKILLS["fullstack"];
  const userSkills = extractSkillsFromCV(cvText, roleSkills);

  const roleTitles: Record<string, string[]> = {
    frontend: ["Frontend Developer", "React Developer", "UI Engineer", "Frontend Engineer", "Web Developer"],
    backend: ["Backend Developer", "Node.js Developer", "API Engineer", "Server Engineer", "Platform Engineer"],
    fullstack: ["Full Stack Developer", "Software Engineer", "Full Stack Engineer", "Web Application Developer"],
    data: ["Data Analyst", "Business Analyst", "Data Engineer", "Analytics Engineer", "BI Developer"],
    design: ["UX Designer", "Product Designer", "UI/UX Designer", "Design Lead", "Interaction Designer"],
    devops: ["DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer", "Platform Engineer", "Infrastructure Engineer"],
    mobile: ["Mobile Developer", "iOS Developer", "Android Developer", "React Native Developer", "Flutter Developer"],
    product: ["Product Manager", "Associate PM", "Senior Product Manager", "Technical PM", "Growth PM"],
  };

  const titles = roleTitles[role] || roleTitles["fullstack"];
  const jobCount = 8 + Math.floor(Math.random() * 5);
  const jobs: MockJob[] = [];

  for (let i = 0; i < jobCount; i++) {
    const title = titles[i % titles.length];
    const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
    const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    const requiredCount = 4 + Math.floor(Math.random() * 3);
    const shuffled = [...roleSkills].sort(() => Math.random() - 0.5);
    const required_skills = shuffled.slice(0, requiredCount);
    const matched = required_skills.filter((s) => userSkills.includes(s));
    const missing_skills = required_skills.filter((s) => !userSkills.includes(s));
    const match_score = Math.round((matched.length / required_skills.length) * 100);

    jobs.push({
      id: `mock-${role}-${i}`,
      title: i > titles.length - 1 ? `Senior ${title}` : title,
      company,
      location,
      type: Math.random() > 0.3 ? "Full-time" : "Contract",
      match_score,
      required_skills,
      missing_skills,
      posted_days_ago: Math.floor(Math.random() * 14) + 1,
    });
  }

  // Sort by match score descending
  jobs.sort((a, b) => b.match_score - a.match_score);
  return jobs;
}

// POST /api/match — accepts { cv_text } and returns mock job matches
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cvText = body.cv_text ?? "";

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "CV text is required (minimum 50 characters)." },
        { status: 400 },
      );
    }

    // Simulate processing time
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

    const jobs = generateMockJobs(cvText);
    const role = detectRole(cvText);

    return NextResponse.json({
      role,
      total_matches: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("Match API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
