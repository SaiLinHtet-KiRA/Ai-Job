"use client";

import { useState, useMemo } from "react";

const MOCK_LEADS = [
  { id: 1, email: "sarah@gmail.com", ip_address: "203.0.113.5", source: "cv_score", created_at: "2025-05-30T10:15:00Z" },
  { id: 2, email: "mike.dev@outlook.com", ip_address: "198.51.100.12", source: "cv_score", created_at: "2025-05-29T16:42:00Z" },
  { id: 3, email: "anna.chen@yahoo.com", ip_address: "192.0.2.88", source: "cv_score", created_at: "2025-05-29T09:30:00Z" },
  { id: 4, email: "john.k@proton.me", ip_address: "203.0.113.22", source: "cv_score", created_at: "2025-05-28T14:20:00Z" },
  { id: 5, email: "priya.s@gmail.com", ip_address: "198.51.100.45", source: "cv_score", created_at: "2025-05-28T08:55:00Z" },
  { id: 6, email: "tom.w@company.co", ip_address: "192.0.2.101", source: "job_match", created_at: "2025-05-27T20:10:00Z" },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

export default function LeadsPage() {
  const [leads] = useState(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (filter !== "all" && lead.source !== filter) return false;
      if (search && !lead.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [leads, search, filter]);

  const exportCSV = () => {
    const headers = ["ID", "Email", "Source", "IP Address", "Created At"];
    const rows = filtered.map((l) => [l.id, l.email, l.source, l.ip_address, l.created_at]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Leads</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} of {leads.length} leads</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-primary/80"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {["all", "cv_score", "job_match"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${filter === s ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {s === "all" ? "All" : s.replace("_", " ")} {s === "all" ? `(${leads.length})` : `(${leads.filter((l) => l.source === s).length})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-64"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>Email</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>IP</th>
              <th className={thClass}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className={tdClass}>
                  <span className="font-medium">{lead.email}</span>
                </td>
                <td className={tdClass}>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${lead.source === "cv_score" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"}`}>
                    {lead.source}
                  </span>
                </td>
                <td className={`${tdClass} font-mono text-xs text-zinc-400`}>{lead.ip_address}</td>
                <td className={`${tdClass} text-zinc-400`}>
                  {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
