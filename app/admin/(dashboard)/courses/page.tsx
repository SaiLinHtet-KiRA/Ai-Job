"use client";

import { useState } from "react";

type Course = {
  id: number;
  title: string;
  url: string;
  platform: string;
  duration: string;
  level: string;
  roles: string[];
};

const MOCK_COURSES: Course[] = [
  { id: 1, title: "React - The Complete Guide", url: "https://udemy.com/react", platform: "Udemy", duration: "48h", level: "beginner", roles: ["frontend developer", "full stack developer"] },
  { id: 2, title: "TypeScript Deep Dive", url: "https://frontendmasters.com/ts", platform: "Frontend Masters", duration: "12h", level: "intermediate", roles: ["frontend developer", "backend developer"] },
  { id: 3, title: "Node.js Design Patterns", url: "https://udemy.com/nodejs", platform: "Udemy", duration: "24h", level: "intermediate", roles: ["backend developer", "full stack developer"] },
  { id: 4, title: "SQL for Data Analysis", url: "https://coursera.org/sql", platform: "Coursera", duration: "20h", level: "beginner", roles: ["data analyst"] },
  { id: 5, title: "Docker & Kubernetes", url: "https://udemy.com/docker", platform: "Udemy", duration: "36h", level: "intermediate", roles: ["devops engineer", "backend developer"] },
  { id: 6, title: "Figma UI Design", url: "https://youtube.com/figma", platform: "YouTube", duration: "8h", level: "beginner", roles: ["ux designer"] },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

export default function CoursesPage() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", roles: "" });

  const handleAdd = () => {
    const newCourse: Course = {
      id: Math.max(...courses.map((c) => c.id)) + 1,
      title: form.title,
      url: form.url,
      platform: form.platform,
      duration: form.duration,
      level: form.level,
      roles: form.roles.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean),
    };
    setCourses((prev) => [...prev, newCourse]);
    setForm({ title: "", url: "", platform: "Udemy", duration: "", level: "beginner", roles: "" });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const inputClass = "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Courses</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{courses.length} courses in catalog</p>
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

      {showForm && (
        <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New Course</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className={inputClass} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className={inputClass} placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <select className={inputClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option>Udemy</option><option>Coursera</option><option>Frontend Masters</option><option>YouTube</option><option>Pluralsight</option><option>Other</option>
            </select>
            <input className={inputClass} placeholder="Duration (e.g. 24h)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <select className={inputClass} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
            <input className={inputClass} placeholder="Roles (comma-separated)" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
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
            {courses.map((course) => (
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
      </div>
    </div>
  );
}
