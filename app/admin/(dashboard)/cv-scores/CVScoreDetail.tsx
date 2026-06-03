"use client";

import { useState, useEffect } from "react";

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

type CVScoreDetailProps = {
  scoreId: number;
  onClose: () => void;
};

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
}

export default function CVScoreDetail({ scoreId, onClose }: CVScoreDetailProps) {
  const [data, setData] = useState<CVScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/cv-scores/${scoreId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [scoreId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-sm text-zinc-400">
        CV score not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{data.file_name}</h3>
          <p className="text-xs text-zinc-400">{data.file_size_kb} KB</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${scoreColor(data.score)}`}>
            {data.score}/100
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{data.email || "—"}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">IP Address</p>
          <p className="mt-1 text-sm font-mono text-zinc-700 dark:text-zinc-300">{data.ip_address}</p>
        </div>
        <div className="sm:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {new Date(data.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            })}
          </p>
        </div>
      </div>

      {data.strengths?.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Strengths</p>
          <ul className="mt-2 space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-300">
                <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.weaknesses?.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Areas to Improve</p>
          <ul className="mt-2 space-y-1">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-300">
                <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.keywords_missing?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Missing Keywords</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.keywords_missing.map((kw, i) => (
              <span key={i} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Summary</p>
        <p className="mt-2 text-sm leading-relaxed text-blue-600 dark:text-blue-300">{data.summary}</p>
      </div>
    </div>
  );
}
