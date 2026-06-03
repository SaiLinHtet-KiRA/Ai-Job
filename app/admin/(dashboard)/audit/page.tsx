"use client";

import { useState, useEffect } from "react";

interface AuditLog {
  id: number;
  admin_email: string;
  action: string;
  target_user_id?: string;
  target_job_id?: number;
  details: string;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  user_banned: "User Banned",
  user_activated: "User Activated",
  email_verified: "Email Verified",
  password_reset_sent: "Password Reset Sent",
  job_created: "Job Created",
  job_updated: "Job Updated",
  job_deleted: "Job Deleted",
};

const actionColors: Record<string, string> = {
  user_banned: "bg-rose-500/10 text-rose-600",
  user_activated: "bg-emerald-500/10 text-emerald-600",
  email_verified: "bg-blue-500/10 text-blue-600",
  password_reset_sent: "bg-amber-500/10 text-amber-600",
  job_created: "bg-purple-500/10 text-purple-600",
  job_updated: "bg-primary/10 text-primary",
  job_deleted: "bg-zinc-500/10 text-zinc-600",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.audit_logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.action === filter;
  });

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
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{filteredLogs.length} audit entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {["all", "user_banned", "user_activated", "email_verified", "password_reset_sent", "job_created"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === f ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {f.replace(/_/g, " ")} {f === "all" ? `(${logs.length})` : `(${logs.filter((l) => l.action === f).length})`}
            </button>
          )
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-400">No audit logs found</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={log.id}
              className="relative flex gap-4 pb-4 last:pb-0"
            >
              {/* Timeline line */}
              {index < filteredLogs.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
              )}

              {/* Icon */}
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${actionColors[log.action] || "bg-zinc-100 text-zinc-600"}`}>
                {actionLabels[log.action]?.[0] || "?"}
              </div>

              {/* Content */}
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
    </div>
  );
}
