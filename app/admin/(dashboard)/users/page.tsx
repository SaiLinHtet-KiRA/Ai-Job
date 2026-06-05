"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

interface UserProfile {
  user_id: string;
  email: string;
  skills: string[];
  experience_level: string;
  target_roles: string[];
  preferred_locations: string[];
  remote_ok: boolean;
  last_scored_at: string | null;
}

interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in: string | null;
  banned: boolean;
  profile: UserProfile | null;
}

const PAGE_SIZE = 10;

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async (p: number, status: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      url.searchParams.set("page", String(p));
      url.searchParams.set("pageSize", String(PAGE_SIZE));
      if (status !== "all") {
        url.searchParams.set("status", status);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPage(data.page);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, statusFilter);
  }, [fetchUsers, statusFilter]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.email?.toLowerCase().includes(q));
  }, [users, search]);

  const bannedCount = users.filter((u) => u.banned).length;
  const activeCount = users.filter((u) => u.last_sign_in && !u.banned).length;

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchUsers(p, statusFilter);
  };

  const handleBan = async (userId: string, ban: boolean) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: ban ? "ban" : "unban" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, banned: ban } : u,
          ),
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, banned: ban } : null));
        }
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Email",
      "Verified",
      "Status",
      "Created",
      "Last Sign In",
      "Experience",
      "Skills",
    ];
    const rows = users.map((u) => [
      u.id,
      u.email,
      u.email_verified,
      u.banned ? "banned" : "active",
      u.created_at,
      u.last_sign_in ?? "",
      u.profile?.experience_level ?? "",
      (u.profile?.skills ?? []).join(";"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {filtered.length} of {total} users &middot; {activeCount} active &middot; {bannedCount} banned
          </p>
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

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: total, color: "text-zinc-600" },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Unverified", value: users.filter((u) => !u.email_verified).length, color: "text-amber-600" },
          { label: "Banned", value: bannedCount, color: "text-rose-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {(["all", "active", "banned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {s} ({s === "all" ? total : s === "banned" ? bannedCount : users.filter((u) => !u.banned).length})
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-72"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className={thClass}>User</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Profile</th>
                <th className={thClass}>Activity</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className={tdClass}>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{user.email}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-zinc-400">{user.id?.slice(0, 8)}...</span>
                          {!user.email_verified && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.banned
                            ? "bg-rose-500/10 text-rose-600"
                            : user.last_sign_in
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-zinc-500/10 text-zinc-500"
                        }`}
                      >
                        {user.banned ? "Banned" : user.last_sign_in ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {user.profile ? (
                        <div className="space-y-1">
                          <p className="text-xs">
                            <span className="text-zinc-400">Level:</span>{" "}
                            <span className="font-medium capitalize">{user.profile.experience_level}</span>
                          </p>
                          <p className="text-xs">
                            <span className="text-zinc-400">Role:</span>{" "}
                            <span className="font-medium">{user.profile.target_roles?.[0] ?? "-"}</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(user.profile.skills ?? []).slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                              >
                                {s}
                              </span>
                            ))}
                            {(user.profile.skills?.length ?? 0) > 3 && (
                              <span className="text-xs text-zinc-400">
                                +{user.profile.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">No profile</span>
                      )}
                    </td>
                    <td className={`${tdClass} text-xs`}>
                      <div className="space-y-1 text-zinc-500 dark:text-zinc-400">
                        <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
                        <p>
                          Last sign in:{" "}
                          {user.last_sign_in
                            ? new Date(user.last_sign_in).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-left text-xs text-primary hover:underline"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBan(user.id, !user.banned)}
                          disabled={actionLoading === user.id}
                          className={`text-left text-xs ${
                            user.banned
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-rose-600 hover:text-rose-700"
                          } disabled:opacity-50`}
                        >
                          {actionLoading === user.id
                            ? "..."
                            : user.banned
                              ? "Activate"
                              : "Ban User"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400"
          >
            Next
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account</h4>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ID:</span>
                    <span className="text-xs">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span
                      className={`font-medium capitalize ${
                        selectedUser.banned ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {selectedUser.banned ? "Banned" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Verified:</span>
                    <span>{selectedUser.email_verified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Created:</span>
                    <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Last Sign In:</span>
                    <span>
                      {selectedUser.last_sign_in
                        ? new Date(selectedUser.last_sign_in).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.profile && (
                <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Profile</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <span className="text-zinc-500">Experience:</span>{" "}
                      <span className="capitalize font-medium">{selectedUser.profile.experience_level}</span>
                    </p>
                    <p>
                      <span className="text-zinc-500">Remote:</span>{" "}
                      <span>{selectedUser.profile.remote_ok ? "Yes" : "No"}</span>
                    </p>
                    <div>
                      <span className="text-zinc-500">Target Roles:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedUser.profile.target_roles ?? []).map((r) => (
                          <span key={r} className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Skills:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedUser.profile.skills ?? []).map((s) => (
                          <span
                            key={s}
                            className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Locations:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedUser.profile.preferred_locations ?? []).map((l) => (
                          <span key={l} className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedUser.profile.last_scored_at && (
                      <p>
                        <span className="text-zinc-500">Last Scored:</span>{" "}
                        <span>{new Date(selectedUser.profile.last_scored_at).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    handleBan(selectedUser.id, !selectedUser.banned);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading === selectedUser.id}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 ${
                    selectedUser.banned
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-rose-500 text-white hover:bg-rose-600"
                  }`}
                >
                  {actionLoading === selectedUser.id
                    ? "..."
                    : selectedUser.banned
                      ? "Activate User"
                      : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
