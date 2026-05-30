"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  company: string;
  email: string;
  location: string;
  type: string;
  salary: number;
  description: string;
  image_url: string;
  company_website: string;
  created_at: string;
  updated_at: string;
}

export function JobListClient({ initialJobs }: { initialJobs: Job[] }) {
  const [list, setList] = useState(initialJobs);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this job?")) return;
      setDeleting(id);
      try {
        const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
        if (res.ok) {
          setList((prev) => prev.filter((j) => j.id !== id));
        }
      } catch {
        //
      }
      setDeleting(null);
    },
    [],
  );

  if (list.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No jobs yet.{" "}
          <Link
            href="/admin/jobs/new"
            className="font-medium text-primary hover:text-primary-dark dark:text-primary/80"
          >
            Create your first job post
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((job) => (
        <div
          key={job.id}
          className="group rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="mb-3 flex items-start justify-between">
            <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary-dark dark:bg-primary/20 dark:text-primary/70">
              {job.type || "On-site"}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              #{job.id}
            </span>
          </div>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {job.company || "—"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.salary != null && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary}
              </span>
            )}
          </div>

          {job.description && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
              {job.description}
            </p>
          )}

          <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-semibold text-zinc-600 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-primary/80"
            >
              Update
            </Link>
            <button
              onClick={() => handleDelete(job.id)}
              disabled={deleting === job.id}
              className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            >
              {deleting === job.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
