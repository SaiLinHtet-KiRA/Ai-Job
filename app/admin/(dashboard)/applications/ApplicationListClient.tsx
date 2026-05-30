"use client";

import { useState, useCallback } from "react";

interface Application {
  id: number;
  name: string;
  email: string;
  position: string;
  type: string;
  salary: number;
  resume_url: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Application[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ApplicationListClient({ initial }: { initial: PaginatedResponse }) {
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?page=${page}&limit=10`);
      const json: PaginatedResponse = await res.json();
      if (res.ok) setState(json);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  if (state.total === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No applications yet. They will appear here when users submit the apply form.
        </p>
      </div>
    );
  }

  const { data: list, page, total, totalPages } = state;
  const from = (page - 1) * 10 + 1;
  const to = Math.min(page * 10, total);

  const pages = generatePages(page, totalPages);

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Name</th>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Email</th>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Position</th>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Type</th>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Salary</th>
                <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Date</th>
                <th className="px-6 py-3 text-right font-semibold text-zinc-500 dark:text-zinc-400">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {list.map((app) => (
                <tr key={app.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{app.name}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{app.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary-dark dark:bg-primary/20 dark:text-primary/70">
                      {app.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{app.type}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{app.salary}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-primary/80"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-zinc-500 dark:text-zinc-400">
            Showing {from}&ndash;{to} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchPage(page - 1)}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-500 transition-all hover:border-primary/30 hover:text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              Prev
            </button>
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-1 text-zinc-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => fetchPage(p as number)}
                  disabled={loading}
                  className={`min-w-[32px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    p === page
                      ? "border-primary bg-primary text-white"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-primary/30 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => fetchPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-500 transition-all hover:border-primary/30 hover:text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function generatePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  }

  return pages;
}
