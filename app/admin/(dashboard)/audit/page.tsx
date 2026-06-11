"use client";

import { useState, useEffect, useCallback } from "react";

interface AuditLog {
  id: number;
  admin_email: string;
  action: string;
  target_user_id?: string;
  target_job_id?: number;
  details: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const actionLabels: Record<string, string> = {
  user_banned: "User Banned",
  user_activated: "User Activated",
  email_verified: "Email Verified",
  password_reset_sent: "Password Reset Sent",
  job_listing_created: "Job Listing Created",
  job_listing_updated: "Job Listing Updated",
  job_listing_deleted: "Job Listing Deleted",
};

const actionColors: Record<string, string> = {
  user_banned: "bg-rose-500/10 text-rose-600",
  user_activated: "bg-emerald-500/10 text-emerald-600",
  email_verified: "bg-blue-500/10 text-blue-600",
  password_reset_sent: "bg-amber-500/10 text-amber-600",
  job_listing_created: "bg-purple-500/10 text-purple-600",
  job_listing_updated: "bg-primary/10 text-primary",
  job_listing_deleted: "bg-zinc-500/10 text-zinc-600",
};

const FILTER_ACTIONS = [
  "all",
  "user_banned",
  "user_activated",
  "email_verified",
  "password_reset_sent",
  "job_listing_created",
  "job_listing_updated",
  "job_listing_deleted",
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAuditLogs = useCallback(async (p: number, actionFilter: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("pageSize", String(PAGE_SIZE));
      if (actionFilter !== "all") params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.audit_logs || []);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAuditLogs(page, filter);
  }, [fetchAuditLogs, page, filter]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
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

  const formatTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diff = now.getTime() - logDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return logDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Audit Log</h1>
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{total} audit entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_ACTIONS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              filter === f ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-6 space-y-4">
        {logs.length === 0 ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-400">No audit logs found</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              className="relative flex gap-4 pb-4 last:pb-0"
            >
              {index < logs.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
              )}

              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${actionColors[log.action] || "bg-zinc-100 text-zinc-600"}`}>
                {actionLabels[log.action]?.[0] || "?"}
              </div>

              <div className="flex-1 rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[log.action] || ""}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{log.details}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{formatTime(log.created_at)}</span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span>By: {log.admin_email}</span>
                  {log.target_user_id && <span>User: {log.target_user_id.slice(0, 8)}...</span>}
                  {log.target_job_id && <span>Job: #{log.target_job_id}</span>}
                </div>
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}
