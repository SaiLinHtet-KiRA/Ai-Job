"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Course = {
  id: number;
  title: string;
  url: string;
  platform: string;
  duration: string;
  level: string;
  roles: string[];
};

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";
const inputClass = "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", roles: [] as string[] });
  const [formError, setFormError] = useState("");
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesSearch, setRolesSearch] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const rolesRef = useRef<HTMLDivElement>(null);
  const rolesInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const mapped: Course[] = (json.data as Array<{
        id: number;
        title: string;
        url: string;
        platform: string;
        duration: string | null;
        level: string;
        role_courses?: { role: string; sort_order: number }[];
      }>).map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        platform: c.platform,
        duration: c.duration ?? "",
        level: c.level,
        roles: (c.role_courses ?? []).map((rc) => rc.role),
      }));
      setCourses(mapped);
      setTotal(json.total ?? mapped.length);
      setTotalPages(json.totalPages ?? 1);
      setPage(json.page ?? 1);
    } catch {
      // fallback to empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableRoles((data as { name: string }[]).map((r) => r.name));
      }
    } catch {
      // keep empty on error
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses(page);
  }, [page, fetchCourses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (rolesOpen && rolesInputRef.current) {
      setTimeout(() => rolesInputRef.current?.focus(), 50);
    }
  }, [rolesOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rolesRef.current && !rolesRef.current.contains(e.target as Node)) {
        setRolesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleCreateRole = async (nameOverride?: string) => {
    const name = (nameOverride ?? rolesSearch).trim().toLowerCase();
    if (!name || availableRoles.includes(name)) return;

    setCreatingRole(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create role" }));
        if (res.status === 409) {
          setAvailableRoles((prev) => prev.includes(name) ? prev : [...prev, name]);
          setForm((prev) => ({ ...prev, roles: prev.roles.includes(name) ? prev.roles : [...prev.roles, name] }));
          setRolesSearch("");
          setNewRoleName("");
          setShowCreateInput(false);
          return;
        }
        setFormError(err.error ?? "Failed to create role");
        return;
      }
      setAvailableRoles((prev) => [...prev, name]);
      setForm((prev) => ({ ...prev, roles: [...prev.roles, name] }));
      setRolesSearch("");
      setNewRoleName("");
      setShowCreateInput(false);
    } catch {
      setFormError("Network error creating role.");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (role: string) => {
    try {
      await fetch(`/api/admin/roles?name=${encodeURIComponent(role)}`, { method: "DELETE" });
      setAvailableRoles((prev) => prev.filter((r) => r !== role));
      setForm((prev) => ({ ...prev, roles: prev.roles.filter((r) => r !== role) }));
    } catch {
      // silently fail
    }
  };

  const handleAdd = async () => {
    setFormError("");
    if (!form.title.trim() || !form.url.trim()) {
      setFormError("Title and URL are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          url: form.url.trim(),
          platform: form.platform,
          duration: form.duration,
          level: form.level,
          roles: form.roles.map((role) => ({ role })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        setFormError(err.error ?? "Save failed");
        return;
      }
      setForm({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", roles: [] });
      setShowForm(false);
      setPage(1);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail; user can retry
    }
  };

  const filteredAvailable = availableRoles.filter((r) =>
    r.toLowerCase().includes(rolesSearch.toLowerCase()),
  );
  const hasExactMatch = filteredAvailable.some(
    (r) => r.toLowerCase() === rolesSearch.trim().toLowerCase(),
  );
  const showCreate = rolesSearch.trim() && !hasExactMatch;

  const filtered = search.trim()
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.url.toLowerCase().includes(search.toLowerCase()) ||
          c.platform.toLowerCase().includes(search.toLowerCase()) ||
          c.roles.some((r) => r.toLowerCase().includes(search.toLowerCase())),
      )
    : courses;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Courses</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{total} courses in catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      <div className="mt-4">
        <input
          className={inputClass}
          placeholder="Search courses by title, URL, platform, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New Course</h2>
          {formError && (
            <p className="mt-2 text-sm text-rose-500">{formError}</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className={inputClass} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className={inputClass} placeholder="URL *" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <select className={inputClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option>Udemy</option><option>Coursera</option><option>Frontend Masters</option><option>YouTube</option><option>Pluralsight</option><option>Other</option>
            </select>
            <input className={inputClass} placeholder="Duration (e.g. 24h)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <select className={inputClass} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
            <div ref={rolesRef} className="relative">
              <button
                type="button"
                onClick={() => setRolesOpen(!rolesOpen)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <span className={form.roles.length === 0 ? "text-zinc-400" : ""}>
                  {form.roles.length === 0 ? "Select roles" : `${form.roles.length} selected`}
                </span>
                <svg className={`h-4 w-4 text-zinc-400 transition-transform ${rolesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {rolesOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="sticky top-0 border-b border-zinc-100 px-2 py-2 dark:border-zinc-700">
                    <input
                      ref={rolesInputRef}
                      className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-primary dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                      placeholder="Search roles..."
                      value={rolesSearch}
                      onChange={(e) => setRolesSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto py-1">
                    {filteredAvailable.map((role) => (
                      <label
                        key={role}
                        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.roles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary/20 dark:border-zinc-600 dark:bg-zinc-700"
                        />
                        <span className="flex-1 capitalize">{role}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteRole(role); }}
                          className="ml-auto rounded p-0.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30"
                          title="Delete role"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </label>
                    ))}
                    {filteredAvailable.length === 0 && !showCreateInput && (
                      <div className="px-3 py-2">
                        {showCreate ? (
                          <button
                            type="button"
                            onClick={() => handleCreateRole()}
                            disabled={creatingRole}
                            className="flex w-full items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {creatingRole ? "Creating..." : `Create "${rolesSearch.trim().toLowerCase()}"`}
                          </button>
                        ) : (
                          <p className="text-sm text-zinc-400">No roles found</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-700">
                    {showCreateInput ? (
                      <div className="flex items-center gap-1 px-2 py-2">
                        <input
                          className="h-8 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-primary dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                          placeholder="Role name..."
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleCreateRole(newRoleName); if (e.key === "Escape") { setShowCreateInput(false); setNewRoleName(""); } }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleCreateRole(newRoleName)}
                          disabled={creatingRole || !newRoleName.trim()}
                          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                          {creatingRole ? "..." : "Create"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setShowCreateInput(true); setRolesSearch(""); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create role
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setShowForm(false); setFormError(""); }} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            {search ? "No courses match your search." : "No courses yet. Add your first course above."}
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className={thClass}>Course</th>
                <th className={thClass}>Platform</th>
                <th className={thClass}>Level</th>
                <th className={thClass}>Duration</th>
                <th className={thClass}>Roles</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className={tdClass}>
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{course.title}</a>
                  </td>
                  <td className={`${tdClass} text-zinc-400`}>{course.platform}</td>
                  <td className={tdClass}>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${course.level === "beginner" ? "bg-emerald-500/10 text-emerald-600" : course.level === "intermediate" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"}`}>
                      {course.level}
                    </span>
                  </td>
                  <td className={`${tdClass} text-zinc-400`}>{course.duration}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-1">
                      {course.roles.map((r) => (
                        <span key={r} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 capitalize dark:bg-zinc-800 dark:text-zinc-400">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className={tdClass}>
                    <button onClick={() => handleDelete(course.id)} className="text-xs text-rose-500 hover:text-rose-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
