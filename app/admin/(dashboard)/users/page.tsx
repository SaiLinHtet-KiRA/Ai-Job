"use client";

import { useState, useMemo } from "react";

// Proper account management structure
const MOCK_USERS = [
  { 
    id: 1, 
    email: "sarah@gmail.com", 
    email_verified: true, 
    status: "active", 
    created_at: "2024-12-15T10:00:00Z",
    last_login: "2025-05-30T08:30:00Z",
    failed_logins: 0,
    profile: {
      user_id: "usr-001",
      skills: ["React", "TypeScript", "CSS", "Next.js"], 
      experience_level: "mid", 
      target_roles: ["Frontend Developer"], 
      remote_ok: true, 
      last_scored_at: "2025-05-30T10:15:00Z" 
    }
  },
  { 
    id: 2, 
    email: "mike.dev@outlook.com", 
    email_verified: true, 
    status: "active", 
    created_at: "2024-11-20T14:30:00Z",
    last_login: "2025-05-29T16:00:00Z",
    failed_logins: 0,
    profile: {
      user_id: "usr-002",
      skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"], 
      experience_level: "senior", 
      target_roles: ["Backend Developer", "Full Stack"], 
      remote_ok: true, 
      last_scored_at: "2025-05-29T16:42:00Z" 
    }
  },
  { 
    id: 3, 
    email: "anna.chen@yahoo.com", 
    email_verified: false, 
    status: "active", 
    created_at: "2025-01-10T09:00:00Z",
    last_login: "2025-05-28T10:00:00Z",
    failed_logins: 2,
    profile: {
      user_id: "usr-003",
      skills: ["Python", "SQL", "Pandas", "Tableau"], 
      experience_level: "junior", 
      target_roles: ["Data Analyst"], 
      remote_ok: false, 
      last_scored_at: "2025-05-29T09:30:00Z" 
    }
  },
  { 
    id: 4, 
    email: "priya.s@gmail.com", 
    email_verified: true, 
    status: "banned", 
    created_at: "2024-10-05T11:00:00Z",
    last_login: "2025-04-15T08:00:00Z",
    failed_logins: 5,
    profile: {
      user_id: "usr-004",
      skills: ["Figma", "User Research", "Prototyping"], 
      experience_level: "mid", 
      target_roles: ["UX Designer"], 
      remote_ok: true, 
      last_scored_at: "2025-05-28T08:55:00Z" 
    }
  },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  banned: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  suspended: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (search && !user.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, search, statusFilter]);

  const exportCSV = () => {
    const headers = ["ID", "Email", "Status", "Verified", "Created", "Last Login", "Failed Logins", "Experience", "Skills"];
    const rows = filtered.map((u) => [u.id, u.email, u.status, u.email_verified, u.created_at, u.last_login, u.failed_logins, u.profile.experience_level, u.profile.skills.join(";")]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u));
  };

  const verifyEmail = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, email_verified: true } : u));
  };

  const sendPasswordReset = async (email: string) => {
    // In real implementation, call API to send reset link
    alert(`Password reset link sent to ${email}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {filtered.length} of {users.length} users &middot; {users.filter(u => u.status === "active").length} active
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

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: users.length, color: "text-zinc-600" },
          { label: "Active", value: users.filter(u => u.status === "active").length, color: "text-emerald-600" },
          { label: "Unverified", value: users.filter(u => !u.email_verified).length, color: "text-amber-600" },
          { label: "Banned", value: users.filter(u => u.status === "banned").length, color: "text-rose-600" },
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
          {["all", "active", "banned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
            >
              {s} {s === "all" ? `(${users.length})` : `(${users.filter((u) => u.status === s).length})`}
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

      {/* Users Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
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
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className={tdClass}>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{user.profile.user_id}</span>
                      {!user.email_verified && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">Unverified</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[user.status] || ""}`}>
                    {user.status}
                  </span>
                  {user.failed_logins > 0 && (
                    <p className="mt-1 text-xs text-rose-500">{user.failed_logins} failed logins</p>
                  )}
                </td>
                <td className={tdClass}>
                  <div className="space-y-1">
                    <p className="text-xs"><span className="text-zinc-400">Level:</span> <span className="font-medium capitalize">{user.profile.experience_level}</span></p>
                    <p className="text-xs"><span className="text-zinc-400">Role:</span> <span className="font-medium">{user.profile.target_roles[0]}</span></p>
                    <div className="flex flex-wrap gap-1">
                      {user.profile.skills.slice(0, 3).map(s => (
                        <span key={s} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{s}</span>
                      ))}
                      {user.profile.skills.length > 3 && (
                        <span className="text-xs text-zinc-400">+{user.profile.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={`${tdClass} text-xs`}>
                  <div className="space-y-1 text-zinc-500 dark:text-zinc-400">
                    <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
                    <p>Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</p>
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
                    {!user.email_verified && (
                      <button 
                        onClick={() => verifyEmail(user.id)}
                        className="text-left text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        Verify Email
                      </button>
                    )}
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      className={`text-left text-xs ${user.status === "active" ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"}`}
                    >
                      {user.status === "active" ? "Ban User" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Account Section */}
              <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account</h4>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Email:</span> <span className="font-medium">{selectedUser.email}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">ID:</span> <span>{selectedUser.id}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Status:</span> <span className={`capitalize font-medium ${selectedUser.status === "active" ? "text-emerald-600" : "text-rose-600"}`}>{selectedUser.status}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Verified:</span> <span>{selectedUser.email_verified ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Created:</span> <span>{new Date(selectedUser.created_at).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Last Login:</span> <span>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never"}</span></div>
                </div>
              </div>

              {/* CV Section */}
              <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">CV</h4>
                <div className="mt-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="font-medium text-emerald-600">Uploaded</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
                      View CV
                    </button>
                    <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
                      Download
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 line-clamp-3">
                    Parsed: React, TypeScript, Node.js, PostgreSQL, 5 years experience...
                  </p>
                </div>
              </div>

              {/* Profile Section */}
              <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Profile</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <p><span className="text-zinc-500">Experience:</span> <span className="capitalize font-medium">{selectedUser.profile.experience_level}</span></p>
                  <p><span className="text-zinc-500">Remote:</span> <span>{selectedUser.profile.remote_ok ? "Yes" : "No"}</span></p>
                  <div>
                    <span className="text-zinc-500">Target Roles:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedUser.profile.target_roles.map(r => (
                        <span key={r} className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Skills:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedUser.profile.skills.map(s => (
                        <span key={s} className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Section */}
              <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recent Applications</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between rounded bg-zinc-50 p-2 dark:bg-zinc-800/50">
                    <div>
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Frontend Developer</p>
                      <p className="text-[10px] text-zinc-500">CloudBase</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">Sent</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-zinc-50 p-2 dark:bg-zinc-800/50">
                    <div>
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Backend Engineer</p>
                      <p className="text-[10px] text-zinc-500">DataFlow</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">Sent</span>
                  </div>
                  <button className="w-full rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    View all applications
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => sendPasswordReset(selectedUser.email)}
                  className="w-full rounded-xl border-2 border-amber-500/30 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-500/10"
                >
                  Send Password Reset
                </button>
                <div className="flex gap-2">
                  {!selectedUser.email_verified && (
                    <button 
                      onClick={() => { verifyEmail(selectedUser.id); setSelectedUser({...selectedUser, email_verified: true}); }}
                      className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      Verify Email
                    </button>
                  )}
                  <button 
                    onClick={() => { toggleStatus(selectedUser.id); setSelectedUser({...selectedUser, status: selectedUser.status === "active" ? "banned" : "active"}); }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${selectedUser.status === "active" ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
                  >
                    {selectedUser.status === "active" ? "Ban User" : "Activate User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
