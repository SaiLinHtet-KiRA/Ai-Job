"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

type EmailLog = {
  id: number;
  type: string;
  to: string;
  subject: string;
  status: string;
  sent_at: string | null;
  error: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const PAGE_SIZE = 10;

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const typeLabels: Record<string, string> = {
  application: "Application",
  application_summary: "App Summary",
  welcome: "Welcome",
  verification: "Verification",
  score: "CV Score",
};

const EMAIL_STATUSES = ["", "sent", "failed", "pending"];

export default function EmailsPage() {
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") ?? "";

  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(typeFromUrl);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0, total: 0 });

  const fetchEmails = useCallback(async (p: number, type: string, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("pageSize", String(PAGE_SIZE));
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmails(data.emails);
      setPage(data.page);
      setTotalPages(data.totalPages);

      const countParams = new URLSearchParams();
      countParams.set("page", "1");
      countParams.set("pageSize", "1");
      const [sentRes, failedRes, pendingRes, totalRes] = await Promise.all([
        fetch(`/api/admin/emails?page=1&pageSize=1&status=sent`),
        fetch(`/api/admin/emails?page=1&pageSize=1&status=failed`),
        fetch(`/api/admin/emails?page=1&pageSize=1&status=pending`),
        fetch(`/api/admin/emails?page=1&pageSize=1`),
      ]);
      const [sentData, failedData, pendingData, totalData] = await Promise.all([
        sentRes.json().catch(() => ({ total: 0 })),
        failedRes.json().catch(() => ({ total: 0 })),
        pendingRes.json().catch(() => ({ total: 0 })),
        totalRes.json().catch(() => ({ total: 0 })),
      ]);
      setStats({
        sent: sentData.total || 0,
        failed: failedData.total || 0,
        pending: pendingData.total || 0,
        total: totalData.total || 0,
      });
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTypeFilter(typeFromUrl);
    fetchEmails(1, typeFromUrl, statusFilter);
  }, [typeFromUrl]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchEmails(p, typeFilter, statusFilter);
  };

  const filtered = search
    ? emails.filter(
        (e) =>
          e.to.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Emails</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stats.total} total emails</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sent", value: stats.sent, color: "text-blue-600" },
          { label: "Failed", value: stats.failed, color: "text-rose-600" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {EMAIL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Status"}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by email or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-64"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>Type</th>
              <th className={thClass}>To</th>
              <th className={thClass}>Subject</th>
              <th className={thClass}>Status</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                  No emails found.
                </td>
              </tr>
            ) : (
              filtered.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => { setPreviewEmail(email); setPreviewOpen(true); }}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className={tdClass}>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {typeLabels[email.type] || email.type}
                    </span>
                  </td>
                  <td className={`${tdClass} font-medium`}>{email.to}</td>
                  <td className={`${tdClass} max-w-xs truncate`}>{email.subject}</td>
                  <td className={tdClass}>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[email.status] || ""}`}>
                      {email.status}
                    </span>
                    {email.error && <p className="mt-1 text-xs text-rose-500 truncate max-w-[200px]">{email.error}</p>}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-zinc-400`}>
                    {email.created_at
                      ? new Date(email.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

      {previewOpen && previewEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Email Details</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="space-y-2 text-sm">
                <p><strong>To:</strong> {previewEmail.to}</p>
                <p><strong>Subject:</strong> {previewEmail.subject}</p>
                <p><strong>Type:</strong> {typeLabels[previewEmail.type] || previewEmail.type}</p>
                <p><strong>Status:</strong> {previewEmail.status}</p>
                {previewEmail.sent_at && (
                  <p><strong>Sent at:</strong> {new Date(previewEmail.sent_at).toLocaleString()}</p>
                )}
                {previewEmail.user_id && (
                  <p><strong>User ID:</strong> {previewEmail.user_id}</p>
                )}
                {previewEmail.error && (
                  <div className="rounded border border-rose-200 bg-rose-50 p-2 dark:border-rose-800 dark:bg-rose-950">
                    <p className="text-rose-600 dark:text-rose-400"><strong>Error:</strong> {previewEmail.error}</p>
                  </div>
                )}
                {previewEmail.metadata && Object.keys(previewEmail.metadata).length > 0 && (
                  <>
                    <hr className="border-zinc-200 dark:border-zinc-700" />
                    <p><strong>Metadata:</strong></p>
                    <pre className="text-xs text-zinc-500 overflow-x-auto">{JSON.stringify(previewEmail.metadata, null, 2)}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
