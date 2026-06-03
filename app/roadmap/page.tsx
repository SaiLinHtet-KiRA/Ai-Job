"use client";

import { useState } from "react";
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  url: string;
  platform: string;
  duration: string | null;
  level: string;
  description: string | null;
  sort_order: number;
};

const POPULAR_ROLES = [
  "frontend developer",
  "backend developer",
  "full stack developer",
  "data analyst",
  "ux designer",
  "product manager",
  "devops engineer",
  "mobile developer",
];

export default function RoadmapPage() {
  const [role, setRole] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchCourses = async (targetRole: string) => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/courses?role=${encodeURIComponent(targetRole.toLowerCase())}`);
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#0a2540] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary-dark">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-white">Learning Roadmap</h1>
        <p className="mt-2 text-[14px] text-[#8898aa]">
          Find the right courses to close your skill gaps and land your target role.
        </p>

        {/* Search */}
        <div className="mt-8 flex gap-2">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") fetchCourses(role); }}
            placeholder="e.g. Frontend Developer"
            className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <button
            onClick={() => fetchCourses(role)}
            className="h-10 rounded-lg bg-primary px-5 text-[13px] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            Search
          </button>
        </div>

        {/* Quick picks */}
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); fetchCourses(r); }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
            >
              {r}
            </button>
          ))}
        </div>

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
          <div className="mt-8 space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">
              {courses.length} course{courses.length !== 1 ? "s" : ""} recommended
            </p>
            {courses.map((course, i) => (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">{platformIcon(course.platform)}</span>
                    <div>
                      <h3 className="text-[15px] font-medium text-white group-hover:text-primary">
                        {i + 1}. {course.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#8898aa]">
                        <span className="capitalize">{course.platform}</span>
                        {course.duration && (
                          <>
                            <span className="text-white/20">&middot;</span>
                            <span>{course.duration}</span>
                          </>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${levelColor(course.level)}`}>
                          {course.level}
                        </span>
                      </div>
                      {course.description && (
                        <p className="mt-2 text-[13px] leading-relaxed text-[#8898aa]">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <svg className="mt-1 h-4 w-4 shrink-0 text-[#8898aa] transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
