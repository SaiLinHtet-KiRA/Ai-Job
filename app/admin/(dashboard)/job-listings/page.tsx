"use client";

import { useState } from "react";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  skills: string[];
  apply_email: string | null;
  apply_url: string | null;
  source: string;
  posted_at: string;
};

const MOCK_JOBS: Job[] = [
  { id: 1, title: "Frontend Developer", company: "CloudBase", location: "Remote", job_type: "full-time", skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"], apply_email: "jobs@cloudbase.io", apply_url: "https://example.com/apply/1", source: "mock", posted_at: "2025-05-28T00:00:00Z" },
  { id: 2, title: "Backend Engineer", company: "DataFlow", location: "Singapore", job_type: "full-time", skills: ["Node.js", "PostgreSQL", "Docker", "AWS"], apply_email: "careers@dataflow.sg", apply_url: null, source: "mock", posted_at: "2025-05-29T00:00:00Z" },
  { id: 3, title: "Full Stack Developer", company: "StartupHub", location: "Remote (APAC)", job_type: "full-time", skills: ["React", "Node.js", "PostgreSQL", "TypeScript"], apply_email: "hire@startuphub.co", apply_url: "https://example.com/apply/3", source: "mock", posted_at: "2025-05-27T00:00:00Z" },
  { id: 4, title: "Data Analyst", company: "PulseTech", location: "Remote", job_type: "full-time", skills: ["Python", "SQL", "Pandas", "Tableau"], apply_email: "data-team@pulsetech.io", apply_url: null, source: "mock", posted_at: "2025-05-30T00:00:00Z" },
  { id: 5, title: "DevOps Engineer", company: "ScaleUp", location: "Remote (US/EU)", job_type: "contract", skills: ["Docker", "Kubernetes", "AWS", "Terraform"], apply_email: "ops@scaleup.dev", apply_url: "https://example.com/apply/5", source: "mock", posted_at: "2025-05-28T00:00:00Z" },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

export default function JobListingsPage() {
  const [jobs, setJobs] = useState(MOCK_JOBS);

  const handleDelete = (id: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Job Listings</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{jobs.length} jobs in the system</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ingest Jobs
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>Job</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Apply</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>Posted</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className={tdClass}>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-zinc-400">{job.company}</p>
                </td>
                <td className={`${tdClass} text-zinc-400`}>{job.location}</td>
                <td className={tdClass}>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.job_type === "full-time" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {job.job_type}
                  </span>
                </td>
                <td className={tdClass}>
                  {job.apply_email ? (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600">email</span>
                  ) : (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">url</span>
                  )}
                </td>
                <td className={`${tdClass} text-zinc-400`}>{job.source}</td>
                <td className={`${tdClass} text-zinc-400 whitespace-nowrap`}>
                  {new Date(job.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className={tdClass}>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-xs text-rose-500 hover:text-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
