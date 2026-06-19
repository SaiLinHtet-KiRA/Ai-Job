"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pagination } from "@/components/ui/Pagination";

type Course = {
  id: number;
  title: string;
  url: string;
  platform: string;
  duration: string | null;
  level: string;
  description: string | null;
  instructor: string;
  created_at: string;
  sort_order: number;
};

export default function RoadmapPage() {
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesSearch, setRolesSearch] = useState("");
  const rolesRef = useRef<HTMLDivElement>(null);
  const rolesInputRef = useRef<HTMLInputElement>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableRoles((data as { name: string }[]).map((r) => r.name));
      }
    } catch {
      // keep empty
    }
  }, []);

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

  const fetchCourses = async (targetRole: string, p = 1) => {
    if (!targetRole.trim()) return;
    setRole(targetRole);
    setLoading(true);
    setSearched(true);
    setRolesOpen(false);
    setPage(p);
    try {
      const res = await fetch(`/api/courses?role=${encodeURIComponent(targetRole.toLowerCase())}&page=${p}&limit=20`);
      const data = await res.json();
      setCourses(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (r: string) => {
    fetchCourses(r);
  };

  const filteredRoles = rolesSearch.trim()
    ? availableRoles.filter((r) => r.toLowerCase().includes(rolesSearch.toLowerCase()))
    : availableRoles;

  const platformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "udemy": return "🎓";
      case "coursera": return "📘";
      case "youtube": return "▶️";
      case "frontend masters": return "⚡";
      case "pluralsight": return "📺";
      default: return "📚";
    }
  };

  const levelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "text-emerald-400 bg-emerald-500/10";
      case "intermediate": return "text-amber-400 bg-amber-500/10";
      case "advanced": return "text-rose-400 bg-rose-500/10";
      default: return "text-[#8898aa] bg-white/5";
    }
  };

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">

        <h1 className="text-2xl font-semibold text-white">Learning Roadmap</h1>
        <p className="mt-2 text-[14px] text-[#8898aa]">
          Find the right courses to close your skill gaps and land your target role.
        </p>

        {/* Role selector */}
        <div className="mt-8 flex gap-2">
          <div ref={rolesRef} className="relative flex-1">
            <button
              type="button"
              onClick={() => setRolesOpen(!rolesOpen)}
              className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-[14px] text-white outline-none transition-colors focus:border-primary/50"
            >
              <span className={!role ? "text-white/25" : ""}>
                {role ? role.replace(/\b\w/g, (c) => c.toUpperCase()) : "Select a role..."}
              </span>
              <svg className={`h-4 w-4 text-white/40 transition-transform ${rolesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {rolesOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#0d2b4a] shadow-xl">
                <div className="border-b border-white/10 px-2 py-2">
                  <input
                    ref={rolesInputRef}
                    className="h-8 w-full rounded-md border border-white/10 bg-white/[0.05] px-2 text-[13px] text-white placeholder-white/25 outline-none focus:border-primary/50"
                    placeholder="Search roles..."
                    value={rolesSearch}
                    onChange={(e) => setRolesSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {filteredRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => selectRole(r)}
                      className={`flex w-full items-center px-3 py-2 text-[13px] capitalize transition-colors hover:bg-white/[0.05] ${role === r ? "text-primary" : "text-[#8898aa]"}`}
                    >
                      {role === r && (
                        <svg className="mr-2 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      <span className={role === r && !rolesSearch ? "" : ""}>{r}</span>
                    </button>
                  ))}
                  {filteredRoles.length === 0 && (
                    <p className="px-3 py-2 text-[13px] text-[#8898aa]/60">No roles found</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => fetchCourses(role)}
            disabled={!role}
            className="h-10 rounded-lg bg-primary px-5 text-[13px] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40"
          >
            Search
          </button>
        </div>

        {/* Popular roles */}
        {availableRoles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {availableRoles.slice(0, 12).map((r) => (
              <button
                key={r}
                onClick={() => selectRole(r)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${role === r ? "border-primary/40 text-primary" : "border-white/10 text-[#8898aa] hover:border-white/20 hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
            <span className="text-[13px] text-[#8898aa]">Loading courses...</span>
          </div>
        )}

        {!loading && searched && courses.length === 0 && (
          <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-[14px] text-[#8898aa]">
              No courses found for this role yet. We&apos;re adding new courses regularly.
            </p>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">
              {total} course{total !== 1 ? "s" : ""} recommended
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course, i) => (
                <a
                  key={course.id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-xl">{platformIcon(course.platform)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${levelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-medium text-white group-hover:text-primary leading-snug">
                    {(page - 1) * 20 + i + 1}. {course.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#8898aa]">
                    <span className="capitalize">{course.platform}</span>
                    {course.duration && (
                      <>
                        <span className="text-white/20">&middot;</span>
                        <span>{course.duration}</span>
                      </>
                    )}
                    {course.instructor && (
                      <>
                        <span className="text-white/20">&middot;</span>
                        <span>{course.instructor}</span>
                      </>
                    )}
                    <span className="text-white/20">&middot;</span>
                    <span>{new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  {course.description && (
                    <p className="mt-3 text-[13px] leading-relaxed text-[#8898aa] line-clamp-3">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex items-center gap-1 text-[12px] text-[#8898aa] group-hover:text-primary">
                    View course
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  variant="dark"
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => fetchCourses(role, p)}
                  showInfo
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
