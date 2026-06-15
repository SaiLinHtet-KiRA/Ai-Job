"use client";

import { useState, useEffect, useRef } from "react";
import JobListingFormModal from "./JobListingFormModal";
import { Pagination } from "@/components/ui/Pagination";

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
  created_at: string;
};

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const PAGE_SIZE = 20;

export default function JobListingsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const loadPage = async (p: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/job-listings?page=${p}&limit=${PAGE_SIZE}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch job listings");
      const json = await res.json();
      setJobs(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      setPage(json.page);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load job listings");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(page);
    return () => abortRef.current?.abort();
  }, [page]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/job-listings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch {
      // silently fail
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Job Listings
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? "Loading..." : `${total} jobs in the system`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadPage(page)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Insert Job
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
          <button onClick={() => loadPage(page)} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                  No job listings found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className={tdClass}>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-zinc-400">{job.company}</p>
                  </td>
                  <td className={`${tdClass} text-zinc-400`}>{job.location}</td>
                  <td className={tdClass}>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.job_type === "full-time"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {job.job_type}
                    </span>
                  </td>
                  <td className={tdClass}>
                    {job.apply_email ? (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600">
                        email
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                        url
                      </span>
                    )}
                  </td>
                  <td className={`${tdClass} text-zinc-400`}>{job.source}</td>
                  <td className={`${tdClass} whitespace-nowrap text-zinc-400`}>
                    {new Date(job.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        showInfo
      />

      <JobListingFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => loadPage(page)}
      />
    </div>
  );
}
