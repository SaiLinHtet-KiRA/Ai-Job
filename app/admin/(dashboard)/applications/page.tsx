"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

type Application = {
  id: number;
  user_id: string;
  method: string;
  status: string;
  sent_at: string;
  created_at: string;
  jobs: {
    id: number;
    title: string;
    company: string;
    location: string;
    apply_email: string;
  } | null;
};

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        const data = await res.json();
        setApps(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const jobTitle = app.jobs?.title?.toLowerCase() || "";
        const company = app.jobs?.company?.toLowerCase() || "";
        const userId = app.user_id?.toLowerCase() || "";
        if (!jobTitle.includes(searchLower) && !company.includes(searchLower) && !userId.includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [apps, search, statusFilter]);

  const exportCSV = () => {
    const headers = ["ID", "User ID", "Job Title", "Company", "Method", "Status", "Sent At"];
    const rows = filtered.map((a) => [
      a.id,
      a.user_id,
      a.jobs?.title || "",
      a.jobs?.company || "",
      a.method,
      a.status,
      a.sent_at || a.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Applications</h1>
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const stats = {
    total: apps.length,
    sent: apps.filter((a) => a.status === "sent").length,
    pending: apps.filter((a) => a.status === "pending").length,
    failed: apps.filter((a) => a.status === "failed").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Applications</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} of {apps.length} applications</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-zinc-600" },
          { label: "Sent", value: stats.sent, color: "text-emerald-600" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
          { label: "Failed", value: stats.failed, color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {["all", "sent", "pending", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {s} {s === "all" ? `(${apps.length})` : `(${apps.filter((a) => a.status === s).length})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search job, company, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-72"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Job</th>
              <th className={thClass}>Method</th>
              <th className={thClass}>Sent To</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">
                  {apps.length === 0 ? "No applications yet." : "No applications match the filter."}
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className={`${tdClass} font-mono text-xs text-zinc-500`}>{app.user_id?.slice(0, 8)}...</td>
                  <td className={tdClass}>
                    <p className="font-medium">{app.jobs?.title || "Unknown Job"}</p>
                    <p className="text-xs text-zinc-400">{app.jobs?.company || "Unknown Company"}</p>
                  </td>
                  <td className={tdClass}>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${app.method === "email" ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                      {app.method}
                    </span>
                  </td>
                  <td className={`${tdClass} font-mono text-xs text-zinc-400`}>{app.jobs?.apply_email || "—"}</td>
                  <td className={tdClass}>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[app.status] ?? "bg-zinc-200/60 text-zinc-500"}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className={`${tdClass} text-zinc-400 whitespace-nowrap`}>
                    {new Date(app.sent_at || app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
