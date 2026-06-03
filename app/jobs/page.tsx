"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  apply_email: string | null;
  apply_url: string | null;
  created_at: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $150k",
    description: "We're looking for an experienced React developer...",
    apply_email: "jobs@techcorp.com",
    apply_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "DataSystems",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $160k",
    description: "Build scalable APIs and microservices...",
    apply_email: null,
    apply_url: "https://datasystems.com/careers",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$100k - $140k",
    description: "Join our fast-growing team...",
    apply_email: "hire@startupxyz.com",
    apply_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "React Native Developer",
    company: "MobileFirst",
    location: "Remote",
    type: "Contract",
    salary: "$80 - $120/hr",
    description: "Build cross-platform mobile apps...",
    apply_email: "contracts@mobilefirst.io",
    apply_url: null,
    created_at: new Date().toISOString(),
  },
];

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs] = useState<Job[]>(MOCK_JOBS);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");

  const handleApply = (job: Job) => {
    if (!session) {
      const { useRouter } = await import("next/navigation");
      return;
    }
    if (job.apply_url) {
      window.open(job.apply_url, "_blank");
    } else {
      alert("Demo: Email apply would be triggered. This is a preview job listing.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location === "all" || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = type === "all" || job.type === type;
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#0a2540] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Browse Jobs</h1>
            <p className="mt-1 text-[14px] text-[#8898aa]">Find your next opportunity</p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
            Demo listings
          </span>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
            >
              Dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[12px] font-medium text-[#8898aa] mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title or company..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white placeholder-white/30 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#8898aa] mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-primary"
              >
                <option value="all">All locations</option>
                <option value="remote">Remote</option>
                <option value="new york">New York</option>
                <option value="san francisco">San Francisco</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#8898aa] mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-primary"
              >
                <option value="all">All types</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-[14px] text-[#8898aa]">No jobs found matching your criteria</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/15"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-medium text-white">{job.title}</h3>
                    <p className="mt-1 text-[13px] text-[#8898aa]">
                      {job.company} &middot; {job.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded bg-white/5 px-2 py-1 text-[11px] text-[#8898aa]">{job.type}</span>
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">{job.salary}</span>
                      {job.apply_email ? (
                        <span className="rounded bg-primary/10 px-2 py-1 text-[11px] text-primary">Email apply</span>
                      ) : (
                        <span className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">External apply</span>
                      )}
                    </div>
                    <p className="mt-3 text-[13px] text-[#8898aa] line-clamp-2">{job.description}</p>
                  </div>
                  <button
                    onClick={() => handleApply(job)}
                    className="rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-primary-dark"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
