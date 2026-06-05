import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { incrementLocationJobsSize, incrementTitleJobsSize } from "@/lib/location";

// Mock job data — simulates what RSS/TheirStack would return
const MOCK_JOBS = [
  {
    external_id: "rem-001",
    title: "Frontend Developer",
    company: "CloudBase",
    location: "Remote",
    job_type: "full-time",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Git"],
    description: "Build and maintain our customer-facing web application using React and Next.js. You'll work closely with design and backend teams.",
    apply_url: "https://example.com/apply/frontend-cloudbase",
    apply_email: "jobs@cloudbase.io",
    source: "mock",
  },
  {
    external_id: "rem-002",
    title: "Backend Engineer",
    company: "DataFlow",
    location: "Singapore",
    job_type: "full-time",
    skills: ["Node.js", "PostgreSQL", "Docker", "AWS", "TypeScript", "REST API"],
    description: "Design and implement scalable APIs and microservices. Own the data layer and infrastructure.",
    apply_url: "https://example.com/apply/backend-dataflow",
    apply_email: "careers@dataflow.sg",
    source: "mock",
  },
  {
    external_id: "rem-003",
    title: "Full Stack Developer",
    company: "StartupHub",
    location: "Remote (APAC)",
    job_type: "full-time",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker", "CI/CD"],
    description: "End-to-end feature development from database to UI. Small team, high ownership.",
    apply_url: "https://example.com/apply/fullstack-startuphub",
    apply_email: "hire@startuphub.co",
    source: "mock",
  },
  {
    external_id: "rem-004",
    title: "React Native Developer",
    company: "Appify",
    location: "Bangkok (Hybrid)",
    job_type: "full-time",
    skills: ["React Native", "TypeScript", "Firebase", "REST API", "Git", "Testing"],
    description: "Build and ship cross-platform mobile apps for our growing user base in Southeast Asia.",
    apply_url: "https://example.com/apply/mobile-appify",
    apply_email: null,
    source: "mock",
  },
  {
    external_id: "rem-005",
    title: "Data Analyst",
    company: "PulseTech",
    location: "Remote",
    job_type: "full-time",
    skills: ["Python", "SQL", "Pandas", "Tableau", "Statistics", "Excel"],
    description: "Turn raw data into actionable insights. Build dashboards and support decision-making across teams.",
    apply_url: "https://example.com/apply/data-pulsetech",
    apply_email: "data-team@pulsetech.io",
    source: "mock",
  },
  {
    external_id: "rem-006",
    title: "Senior UX Designer",
    company: "ClearCode",
    location: "London (Remote)",
    job_type: "full-time",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "HTML/CSS"],
    description: "Lead design for our SaaS platform. Conduct research, create prototypes, and ship polished interfaces.",
    apply_url: "https://example.com/apply/ux-clearcode",
    apply_email: "design@clearcode.uk",
    source: "mock",
  },
  {
    external_id: "rem-007",
    title: "DevOps Engineer",
    company: "ScaleUp",
    location: "Remote (US/EU)",
    job_type: "contract",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Monitoring"],
    description: "Build and maintain our cloud infrastructure. Automate deployments and ensure 99.9% uptime.",
    apply_url: "https://example.com/apply/devops-scaleup",
    apply_email: "ops@scaleup.dev",
    source: "mock",
  },
  {
    external_id: "rem-008",
    title: "Product Manager",
    company: "NextGen Labs",
    location: "San Francisco (Hybrid)",
    job_type: "full-time",
    skills: ["Roadmapping", "Analytics", "A/B Testing", "SQL", "Agile", "Stakeholder Management"],
    description: "Own the product roadmap for our core platform. Work with engineering, design, and leadership.",
    apply_url: "https://example.com/apply/pm-nextgen",
    apply_email: null,
    source: "mock",
  },
  {
    external_id: "rem-009",
    title: "Python Backend Developer",
    company: "ByteShift",
    location: "Berlin",
    job_type: "full-time",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker", "REST API"],
    description: "Build performant APIs for our fintech platform. Handle high-traffic data processing pipelines.",
    apply_url: "https://example.com/apply/python-byteshift",
    apply_email: "eng@byteshift.de",
    source: "mock",
  },
  {
    external_id: "rem-010",
    title: "Frontend Engineer (Vue.js)",
    company: "ZenDev",
    location: "Tokyo (Remote OK)",
    job_type: "full-time",
    skills: ["Vue.js", "TypeScript", "CSS", "Nuxt.js", "Testing", "Git"],
    description: "Join our frontend team building beautiful, performant web apps for the Japanese market.",
    apply_url: "https://example.com/apply/vue-zendev",
    apply_email: "jobs@zendev.jp",
    source: "mock",
  },
];

// POST /api/jobs/ingest — seed/ingest job listings
// In production: called by cron, fetches from RSS/TheirStack
// For now: seeds mock data
export async function POST(req: NextRequest) {
  // Simple auth check — only admin or cron can call this
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is set, require it. Otherwise allow (dev mode).
    if (cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();

  // Upsert jobs (don't duplicate)
  let inserted = 0;
  let skipped = 0;

  for (const job of MOCK_JOBS) {
    const { error } = await supabase.from("job_listings").upsert(
      {
        external_id: job.external_id,
        title: job.title,
        company: job.company,
        location: job.location,
        job_type: job.job_type,
        skills: job.skills,
        description: job.description,
        apply_url: job.apply_url,
        apply_email: job.apply_email,
        source: job.source,
          },
      { onConflict: "source,external_id" },
    );

    if (error) {
      skipped++;
    } else {
      inserted++;
      incrementLocationJobsSize(job.location).catch((err) =>
        console.error("Failed to increment location jobs_size:", err)
      );
      incrementTitleJobsSize(job.title).catch((err) =>
        console.error("Failed to increment title jobs_size:", err)
      );
    }
  }

  return NextResponse.json({
    success: true,
    inserted,
    skipped,
    total: MOCK_JOBS.length,
  });
}
