"use client";

import { useState, useEffect, useCallback } from "react";
import CVScoreDetail from "./CVScoreDetail";

type CVScore = {
  id: number;
  ip_address: string;
  email: string | null;
  file_name: string;
  file_size_kb: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
  created_at: string;
};

const PAGE_SIZE = 10;

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
}

export default function CVScoresPage() {
  const [scores, setScores] = useState<CVScore[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null);

  const fetchScores = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cv-scores?page=${p}&pageSize=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setScores(data.scores);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScores(1);
  }, [fetchScores]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchScores(p);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">CV Scores</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{total} scored CVs</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>File</th>
              <th className={thClass}>Score</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Summary</th>
              <th className={thClass}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : scores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                  No CV scores yet.
                </td>
              </tr>
            ) : (
              scores.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedScoreId(s.id)}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className={tdClass}>
                    <div>
                      <p className="font-medium">{s.file_name}</p>
                      <p className="text-xs text-zinc-400">{s.file_size_kb} KB</p>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(s.score)}`}
                    >
                      {s.score}/100
                    </span>
                  </td>
                  <td className={`${tdClass} text-zinc-400`}>{s.email ?? "—"}</td>
                  <td className={`${tdClass} max-w-xs truncate text-zinc-400`}>{s.summary}</td>
                  <td className={`${tdClass} whitespace-nowrap text-zinc-400`}>
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Prev
          </button>
          {getPageNumbers().map((p, i) =>
            typeof p === "string" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-zinc-400">...</span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  p === page
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      )}

      {selectedScoreId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            data-testid="modal-backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedScoreId(null)}
          />
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <CVScoreDetail scoreId={selectedScoreId} onClose={() => setSelectedScoreId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
