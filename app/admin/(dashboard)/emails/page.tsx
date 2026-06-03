"use client";

import { useState } from "react";

type Email = {
  id: number;
  type: string;
  to: string;
  subject: string;
  status: string;
  sent_at: string | null;
  opened: boolean;
  clicked: boolean;
  error?: string;
};

const MOCK_EMAILS: Email[] = [
  { id: 1, type: "digest", to: "sarah@gmail.com", subject: "Your Daily Job Digest - 3 New Matches", status: "sent", sent_at: "2025-05-30T08:00:00Z", opened: true, clicked: true },
  { id: 2, type: "digest", to: "mike.dev@outlook.com", subject: "Your Daily Job Digest - 2 New Matches", status: "sent", sent_at: "2025-05-30T08:00:00Z", opened: true, clicked: false },
  { id: 3, type: "application", to: "jobs@cloudbase.io", subject: "Application: Frontend Developer - Sarah", status: "sent", sent_at: "2025-05-30T10:30:00Z", opened: false, clicked: false },
  { id: 4, type: "welcome", to: "anna.chen@yahoo.com", subject: "Welcome to easy2apply", status: "sent", sent_at: "2025-05-29T14:20:00Z", opened: true, clicked: true },
  { id: 5, type: "digest", to: "priya.s@gmail.com", subject: "Your Daily Job Digest - 1 New Match", status: "failed", sent_at: null, opened: false, clicked: false, error: "Invalid recipient" },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const typeLabels: Record<string, string> = {
  digest: "Daily Digest",
  application: "Application",
  welcome: "Welcome",
  notification: "Notification",
};

export default function EmailsPage() {
  const [emails, setEmails] = useState(MOCK_EMAILS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<typeof MOCK_EMAILS[0] | null>(null);

  const filtered = emails.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search && !e.to.toLowerCase().includes(search.toLowerCase()) && !e.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleResend = (id: number) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: "sent", sent_at: new Date().toISOString() } : e));
  };

  const openPreview = (email: typeof MOCK_EMAILS[0]) => {
    setPreviewEmail(email);
    setPreviewOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Emails</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{emails.length} total emails</p>
        </div>
        <button
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Preview Digest
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Sent", value: emails.filter((e) => e.status === "sent").length, color: "text-blue-600" },
          { label: "Opened", value: emails.filter((e) => e.opened).length, color: "text-purple-600" },
          { label: "Clicked", value: emails.filter((e) => e.clicked).length, color: "text-emerald-600" },
          { label: "Failed", value: emails.filter((e) => e.status === "failed").length, color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["all", "sent", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${filter === s ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {s} {s === "all" ? `(${emails.length})` : `(${emails.filter((e) => e.status === s).length})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by email or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>Type</th>
              <th className={thClass}>To</th>
              <th className={thClass}>Subject</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Engagement</th>
              <th className={thClass}>Date</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((email) => (
              <tr key={email.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
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
                  {email.error && <p className="mt-1 text-xs text-rose-500">{email.error}</p>}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-2 text-xs">
                    {email.opened && <span className="text-purple-600">Opened</span>}
                    {email.clicked && <span className="text-emerald-600">Clicked</span>}
                    {!email.opened && !email.clicked && <span className="text-zinc-400">-</span>}
                  </div>
                </td>
                <td className={`${tdClass} text-zinc-400 whitespace-nowrap`}>
                  {email.sent_at ? new Date(email.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-2">
                    <button onClick={() => openPreview(email)} className="text-xs text-primary hover:underline">Preview</button>
                    {email.status === "failed" && (
                      <button onClick={() => handleResend(email.id)} className="text-xs text-emerald-600 hover:text-emerald-700">Resend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {previewEmail ? "Email Preview" : "Digest Preview"}
              </h3>
              <button onClick={() => setPreviewOpen(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              {previewEmail ? (
                <div className="space-y-2 text-sm">
                  <p><strong>To:</strong> {previewEmail.to}</p>
                  <p><strong>Subject:</strong> {previewEmail.subject}</p>
                  <p><strong>Type:</strong> {typeLabels[previewEmail.type]}</p>
                  <hr className="border-zinc-200 dark:border-zinc-700" />
                  <p className="text-zinc-500">[Email body would render here]</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-zinc-900 dark:text-white">Daily Digest Preview</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Good morning! Here are your 3 job matches for today:</p>
                  <div className="space-y-2">
                    {["Frontend Developer at CloudBase (85% match)", "Backend Engineer at DataFlow (72% match)", "Full Stack at StartupHub (68% match)"].map((job, i) => (
                      <div key={i} className="rounded-lg bg-white p-3 dark:bg-zinc-900">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{job}</p>
                        <button className="mt-2 text-xs text-primary hover:underline">View Details →</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
