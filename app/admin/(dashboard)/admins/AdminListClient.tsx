"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Admin {
  id: number;
  email: string;
  created_at: string;
}

export function AdminListClient({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [list, setList] = useState(initialAdmins);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this admin?")) return;
      setDeleting(id);
      setError("");
      try {
        const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          setList((prev) => prev.filter((a) => a.id !== id));
        } else {
          setError(data.error || "Failed to delete admin.");
        }
      } catch {
        setError("Network error.");
      }
      setDeleting(null);
    },
    [],
  );

  if (list.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No admin accounts yet. Create the first one or use the bootstrap credentials from .env.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="px-6 py-3 font-semibold text-zinc-500 dark:text-zinc-400">Created</th>
              <th className="px-6 py-3 text-right font-semibold text-zinc-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {list.map((admin) => (
              <tr key={admin.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                  {admin.email}
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/admins/${admin.id}/edit`}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      disabled={deleting === admin.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                    >
                      {deleting === admin.id ? "..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
