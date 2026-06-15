"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

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
  job_listing_created: "Job Listing Created",
  job_listing_updated: "Job Listing Updated",
  job_listing_deleted: "Job Listing Deleted",
};

const actionColors: Record<string, string> = {
  user_banned: "bg-rose-500/10 text-rose-600",
  user_activated: "bg-emerald-500/10 text-emerald-600",
  job_listing_created: "bg-purple-500/10 text-purple-600",
  job_listing_updated: "bg-primary/10 text-primary",
  job_listing_deleted: "bg-zinc-500/10 text-zinc-600",
};

const FILTER_ACTIONS = [
  "all",
  "user_banned",
  "user_activated",
  "job_listing_created",
  "job_listing_updated",
  "job_listing_deleted",
];

export default function AuditLogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionFromUrl = searchParams.get("action") ?? "all";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(actionFromUrl);

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
    setFilter(actionFromUrl);
    setPage(1);
    fetchAuditLogs(1, actionFromUrl);
  }, [actionFromUrl]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
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
            onClick={() => {
              setFilter(f);
              setPage(1);
              const params = new URLSearchParams(searchParams.toString());
              if (f !== "all") params.set("action", f);
              else params.delete("action");
              router.replace(`/admin/audit?${params.toString()}`, { scroll: false });
            }}
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

      <div className="mt-6 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}
