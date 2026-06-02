"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Job {
  title: string;
  company: string;
  location: string;
  apply_email: string;
}

interface Application {
  id: number;
  cover_letter: string;
  method: string;
  status: string;
  sent_at: string;
  created_at: string;
  job_id: number;
  jobs: Job;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  sent: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-rose-500/10 text-rose-400",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    sent: applications.filter((a) => a.status === "sent").length,
    pending: applications.filter((a) => a.status === "pending").length,
    failed: applications.filter((a) => a.status === "failed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a2540] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a2540] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Applications</h1>
            <p className="mt-1 text-[14px] text-[#8898aa]">Track your job applications</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
            >
              Dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-zinc-300" },
            { label: "Sent", value: stats.sent, color: "text-emerald-400" },
            { label: "Pending", value: stats.pending, color: "text-amber-400" },
            { label: "Failed", value: stats.failed, color: "text-rose-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[12px] text-[#8898aa]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mt-6 flex gap-2">
          {["all", "sent", "pending", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-all ${
                filter === f
                  ? "bg-primary/10 text-primary"
                  : "text-[#8898aa] hover:bg-white/5"
              }`}
            >
              {f} ({f === "all" ? stats.total : stats[f as keyof typeof stats]})
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-[14px] text-[#8898aa]">
                {applications.length === 0
                  ? "No applications yet. Go to Dashboard to apply to matched jobs."
                  : "No applications match the selected filter."}
              </p>
              {applications.length === 0 && (
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/15"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{app.jobs?.title || "Unknown Job"}</h3>
                    <p className="text-[13px] text-[#8898aa]">
                      {app.jobs?.company || "Unknown Company"} &middot; {app.jobs?.location || ""}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                          statusColors[app.status] || "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="text-[11px] text-[#8898aa]">
                        {app.method === "email" ? "Email application" : "Portal application"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#8898aa]">
                      {new Date(app.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {app.sent_at && (
                      <p className="text-[11px] text-emerald-400">
                        Sent {new Date(app.sent_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Letter Preview */}
                <div className="mt-4 rounded-lg bg-white/[0.02] p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#8898aa]">
                    Cover Letter
                  </p>
                  <p className="mt-1 line-clamp-3 text-[12px] text-white/60">
                    {app.cover_letter}
                  </p>
                </div>

                {/* Recipients */}
                {app.jobs?.apply_email && (
                  <p className="mt-3 text-[11px] text-[#8898aa]">
                    Sent to: {app.jobs.apply_email}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
