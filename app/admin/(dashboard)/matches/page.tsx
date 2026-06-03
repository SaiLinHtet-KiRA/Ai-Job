"use client";

import { useState, useMemo } from "react";

type Match = {
  id: number;
  user_email: string;
  job_title: string;
  company: string;
  match_score: number;
  status: string;
  missing_skills: string[];
  matched_at: string;
};

const MOCK_MATCHES: Match[] = [
  { id: 1, user_email: "sarah@gmail.com", job_title: "Frontend Developer", company: "CloudBase", match_score: 85, status: "approved", missing_skills: ["Docker"], matched_at: "2025-05-30T08:00:00Z" },
  { id: 2, user_email: "sarah@gmail.com", job_title: "Full Stack Developer", company: "StartupHub", match_score: 72, status: "pending", missing_skills: ["PostgreSQL", "AWS"], matched_at: "2025-05-30T08:00:00Z" },
  { id: 3, user_email: "mike.dev@outlook.com", job_title: "Backend Engineer", company: "DataFlow", match_score: 91, status: "applied", missing_skills: [], matched_at: "2025-05-30T08:00:00Z" },
  { id: 4, user_email: "mike.dev@outlook.com", job_title: "DevOps Engineer", company: "ScaleUp", match_score: 65, status: "skipped", missing_skills: ["Kubernetes", "Terraform"], matched_at: "2025-05-30T08:00:00Z" },
  { id: 5, user_email: "anna.chen@yahoo.com", job_title: "Data Analyst", company: "PulseTech", match_score: 78, status: "pending", missing_skills: ["Tableau"], matched_at: "2025-05-30T08:00:00Z" },
  { id: 6, user_email: "priya.s@gmail.com", job_title: "Senior UX Designer", company: "ClearCode", match_score: 70, status: "approved", missing_skills: ["Design Systems"], matched_at: "2025-05-29T08:00:00Z" },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  applied: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  skipped: "bg-zinc-200/60 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function MatchesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK_MATCHES.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (search && !m.user_email.toLowerCase().includes(search.toLowerCase()) && !m.job_title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Matches</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{MOCK_MATCHES.length} total matches</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {["all", "pending", "approved", "applied", "skipped"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${filter === s ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {s} {s === "all" ? `(${MOCK_MATCHES.length})` : `(${MOCK_MATCHES.filter((m) => m.status === s).length})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search user or job..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-64"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Job</th>
              <th className={thClass}>Score</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Gaps</th>
              <th className={thClass}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((match) => (
              <tr key={match.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className={`${tdClass} font-medium`}>{match.user_email}</td>
                <td className={tdClass}>
                  <p className="font-medium">{match.job_title}</p>
                  <p className="text-xs text-zinc-400">{match.company}</p>
                </td>
                <td className={tdClass}>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${match.match_score >= 70 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {match.match_score}%
                  </span>
                </td>
                <td className={tdClass}>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[match.status] ?? ""}`}>
                    {match.status}
                  </span>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-1">
                    {match.missing_skills.length > 0 ? match.missing_skills.map((s) => (
                      <span key={s} className="rounded bg-rose-500/10 px-1.5 py-0.5 text-xs text-rose-500">{s}</span>
                    )) : <span className="text-xs text-zinc-400">None</span>}
                  </div>
                </td>
                <td className={`${tdClass} text-zinc-400 whitespace-nowrap`}>
                  {new Date(match.matched_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
