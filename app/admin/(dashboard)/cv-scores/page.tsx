"use client";

import { useState } from "react";

const MOCK_SCORES = [
  { id: 1, email: "sarah@gmail.com", score: 78, file_name: "Sarah_CV.pdf", file_size: 245760, summary: "Strong frontend profile with React experience", created_at: "2025-05-30T10:12:00Z" },
  { id: 2, email: null, score: 52, file_name: "resume.docx", file_size: 128000, summary: "Junior developer, needs more project experience", created_at: "2025-05-30T09:45:00Z" },
  { id: 3, email: "mike.dev@outlook.com", score: 85, file_name: "Mike_Resume_2025.pdf", file_size: 312000, summary: "Senior full-stack engineer with cloud expertise", created_at: "2025-05-29T16:40:00Z" },
  { id: 4, email: "anna.chen@yahoo.com", score: 64, file_name: "CV_Anna.pdf", file_size: 198000, summary: "Data analyst transitioning to engineering", created_at: "2025-05-29T09:28:00Z" },
  { id: 5, email: null, score: 71, file_name: "CV.pdf", file_size: 156000, summary: "Mid-level backend developer, good Python skills", created_at: "2025-05-28T22:15:00Z" },
  { id: 6, email: "john.k@proton.me", score: 43, file_name: "John_K_CV.pdf", file_size: 89000, summary: "Career changer, limited tech experience", created_at: "2025-05-28T14:18:00Z" },
];

const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const tdClass = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
}

export default function CVScoresPage() {
  const [scores] = useState(MOCK_SCORES);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">CV Scores</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{scores.length} scored CVs</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <table className="w-full">
          <thead className="border-b border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className={thClass}>File</th>
              <th className={thClass}>Score</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Summary</th>
              <th className={thClass}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {scores.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className={tdClass}>
                  <div>
                    <p className="font-medium">{s.file_name}</p>
                    <p className="text-xs text-zinc-400">{(s.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                </td>
                <td className={tdClass}>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(s.score)}`}>
                    {s.score}/100
                  </span>
                </td>
                <td className={`${tdClass} text-zinc-400`}>{s.email ?? "—"}</td>
                <td className={`${tdClass} max-w-xs truncate text-zinc-400`}>{s.summary}</td>
                <td className={`${tdClass} text-zinc-400 whitespace-nowrap`}>
                  {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
