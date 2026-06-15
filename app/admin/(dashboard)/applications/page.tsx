"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo, useCallback } from "react";

interface JobWithApps {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  apply_email: string;
  applicationCount: number;
  applicationIds: number[];
}

interface AppDetail {
  id: number;
  name: string | null;
  email: string;
  position: string;
  type: string;
  salary: string;
  cv_url: string | null;
  cover_letter: string | null;
  method: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  user_id: string | null;
}

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<JobWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobWithApps | null>(null);
  const [jobApps, setJobApps] = useState<AppDetail[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/job-applications");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch job applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const filtered = useMemo(() => {
    if (!search) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  const totalApps = jobs.reduce((sum, j) => sum + j.applicationCount, 0);

  const openJob = async (job: JobWithApps) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const ids = job.applicationIds.join(",");
      const res = await fetch(`/api/admin/job-applications?job_id=${job.id}&ids=${ids}`);
      if (res.ok) {
        const data = await res.json();
        setJobApps(data.applications || []);
      }
    } catch {
      setJobApps([]);
    } finally {
      setAppsLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Application Log</h1>
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Application Log</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{jobs.length} jobs with applications</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Jobs with Applications", value: jobs.length, color: "text-zinc-600" },
          { label: "Total Applications", value: totalApps, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by job title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-72"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>Job</th>
              <th className={thClass}>Company</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Applications</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-400">
                  No applications found.
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => openJob(job)}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className={`${tdClass} font-medium text-primary`}>{job.title}</td>
                  <td className={tdClass}>{job.company}</td>
                  <td className={tdClass}>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">{job.job_type}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary dark:bg-primary/20">
                      {job.applicationCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Applications popup */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200/60 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{selectedJob.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedJob.company} &middot; {selectedJob.applicationCount} application{selectedJob.applicationCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => { setSelectedJob(null); setJobApps([]); }}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {appsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : jobApps.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No applications found.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Name</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Email</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Type</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Salary</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Status</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">Date</th>
                        <th className="px-3 py-2 font-semibold text-zinc-500">CV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {jobApps.map((app) => (
                        <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.name || "—"}</td>
                          <td className="px-3 py-2 text-zinc-500">{app.email}</td>
                          <td className="px-3 py-2 text-zinc-500">{app.type}</td>
                          <td className="px-3 py-2 text-zinc-500">{app.salary}</td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[app.status] ?? "bg-zinc-200/60 text-zinc-500"}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-zinc-400">
                            {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="px-3 py-2">
                            {app.cv_url ? (
                              <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                View
                              </a>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
