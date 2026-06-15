"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pagination } from "@/components/ui/Pagination";

type Course = {
  id: number;
  title: string;
  url: string;
  platform: string;
  duration: string;
  level: string;
  instructor: string;
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
  const [form, setForm] = useState({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", instructor: "", roles: [] as string[] });
  const [formError, setFormError] = useState("");
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesSearch, setRolesSearch] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<BulkCourse[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const rolesRef = useRef<HTMLDivElement>(null);
  const rolesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface BulkCourse {
    title: string;
    url: string;
    platform?: string;
    duration?: string;
    level?: string;
    instructor?: string;
    roles?: string[];
  }

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
        instructor: string | null;
        role_courses?: { role: string; sort_order: number }[];
      }>).map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        platform: c.platform,
        duration: c.duration ?? "",
        level: c.level,
        instructor: c.instructor ?? "",
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
          instructor: form.instructor.trim(),
          roles: form.roles.map((role) => ({ role })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        setFormError(err.error ?? "Save failed");
        return;
      }
      setForm({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", instructor: "", roles: [] });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        let parsed: BulkCourse[];

        if (file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          parsed = Array.isArray(data) ? data : data.courses ?? data.data ?? [];
          if (!Array.isArray(parsed)) throw new Error("JSON must contain an array of courses");
        } else {
          parsed = parseCSV(text);
        }

        if (parsed.length === 0) {
          setImportError("No courses found in file");
          return;
        }

        setImportPreview(parsed);
        setImportOpen(true);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Failed to parse file");
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const parseCSV = (text: string): BulkCourse[] => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const titleIdx = headers.indexOf("title");
    const urlIdx = headers.indexOf("url");

    if (titleIdx === -1 || urlIdx === -1) {
      throw new Error("CSV must have 'title' and 'url' columns");
    }

    const platformIdx = headers.indexOf("platform");
    const durationIdx = headers.indexOf("duration");
    const levelIdx = headers.indexOf("level");
    const instructorIdx = headers.indexOf("instructor");
    const rolesIdx = headers.indexOf("roles");

    return lines.slice(1).map((line) => {
      const cols = parseCSVLine(line);
      const get = (idx: number) => cols[idx]?.trim().replace(/^"|"$/g, "") || "";
      return {
        title: get(titleIdx),
        url: get(urlIdx),
        platform: platformIdx >= 0 ? get(platformIdx) : undefined,
        duration: durationIdx >= 0 ? get(durationIdx) : undefined,
        level: levelIdx >= 0 ? get(levelIdx) : undefined,
        instructor: instructorIdx >= 0 ? get(instructorIdx) : undefined,
        roles: rolesIdx >= 0 && get(rolesIdx)
          ? get(rolesIdx).split(";").map((r) => r.trim()).filter(Boolean)
          : undefined,
      };
    }).filter((c) => c.title && c.url);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  };

  const handleBulkImport = async () => {
    if (importPreview.length === 0) return;
    setImportLoading(true);
    setImportError("");
    try {
      const res = await fetch("/api/admin/courses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: importPreview }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Import failed");
        return;
      }
      setImportOpen(false);
      setImportPreview([]);
      setImportFileName("");
      fetchCourses(page);
    } catch {
      setImportError("Network error during import");
    } finally {
      setImportLoading(false);
    }
  };

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
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-all hover:border-primary/30 hover:text-primary-dark dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import
          </button>
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
      </div>

      <div className="mt-4">
        <input
          className={inputClass}
          placeholder="Search courses by title, URL, platform, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          className="hidden"
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
            <input className={inputClass} placeholder="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
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
                <th className={thClass}>Instructor</th>
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
                  <td className={`${tdClass} text-zinc-400`}>{course.instructor || "—"}</td>
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
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showInfo
        />
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200/60 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Import Courses</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{importFileName} &middot; {importPreview.length} courses</p>
              </div>
              <button
                onClick={() => { setImportOpen(false); setImportPreview([]); setImportError(""); }}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {importError && (
                <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950 dark:text-rose-400">{importError}</p>
              )}
              <div className="max-h-96 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-zinc-500">Title</th>
                      <th className="px-3 py-2 font-semibold text-zinc-500">Instructor</th>
                      <th className="px-3 py-2 font-semibold text-zinc-500">URL</th>
                      <th className="px-3 py-2 font-semibold text-zinc-500">Platform</th>
                      <th className="px-3 py-2 font-semibold text-zinc-500">Level</th>
                      <th className="px-3 py-2 font-semibold text-zinc-500">Roles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {importPreview.map((c, i) => (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="max-w-[200px] truncate px-3 py-2 text-zinc-700 dark:text-zinc-300">{c.title}</td>
                        <td className="px-3 py-2 text-zinc-500">{c.instructor || "—"}</td>
                        <td className="max-w-[150px] truncate px-3 py-2 text-zinc-500">{c.url}</td>
                        <td className="px-3 py-2 text-zinc-500">{c.platform || "—"}</td>
                        <td className="px-3 py-2 text-zinc-500">{c.level || "—"}</td>
                        <td className="px-3 py-2 text-zinc-500">{(c.roles ?? []).join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setImportOpen(false); setImportPreview([]); setImportError(""); }}
                  className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={importLoading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {importLoading ? "Importing..." : `Import ${importPreview.length} Courses`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
