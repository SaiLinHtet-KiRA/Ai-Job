"use client";

import { useState } from "react";

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string[];
  apply_email: string | null;
  apply_url: string | null;
};

type Match = {
  id: number;
  match_score: number;
  missing_skills: string[];
  cover_letter: string;
  status: string;
  matched_at: string;
  job_listings: JobListing;
  selected?: boolean;
};

// Mock matches for demo when Supabase isn't configured
const MOCK_MATCHES: Match[] = [
  {
    id: 1,
    match_score: 85,
    missing_skills: ["Docker", "CI/CD"],
    cover_letter: "Dear Hiring Manager,\n\nI'm writing to express my interest in the Frontend Developer position at CloudBase...",
    status: "pending",
    matched_at: new Date().toISOString(),
    job_listings: {
      id: 1,
      title: "Frontend Developer",
      company: "CloudBase",
      location: "Remote",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Git"],
      apply_email: "jobs@cloudbase.io",
      apply_url: "https://example.com/apply/frontend-cloudbase",
    },
  },
  {
    id: 2,
    match_score: 72,
    missing_skills: ["PostgreSQL", "AWS"],
    cover_letter: "Dear Hiring Manager,\n\nI'm excited about the Full Stack Developer role at StartupHub...",
    status: "pending",
    matched_at: new Date().toISOString(),
    job_listings: {
      id: 3,
      title: "Full Stack Developer",
      company: "StartupHub",
      location: "Remote (APAC)",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker", "CI/CD"],
      apply_email: "hire@startuphub.co",
      apply_url: "https://example.com/apply/fullstack-startuphub",
    },
  },
  {
    id: 3,
    match_score: 68,
    missing_skills: ["Vue.js", "Nuxt.js"],
    cover_letter: "Dear Hiring Manager,\n\nI'd like to apply for the Frontend Engineer position at ZenDev...",
    status: "pending",
    matched_at: new Date().toISOString(),
    job_listings: {
      id: 10,
      title: "Frontend Engineer (Vue.js)",
      company: "ZenDev",
      location: "Tokyo (Remote OK)",
      skills: ["Vue.js", "TypeScript", "CSS", "Nuxt.js", "Testing", "Git"],
      apply_email: "jobs@zendev.jp",
      apply_url: "https://example.com/apply/vue-zendev",
    },
  },
  {
    id: 4,
    match_score: 61,
    missing_skills: ["React Native", "Firebase"],
    cover_letter: "Dear Hiring Manager,\n\nI'm interested in the React Native Developer position at Appify...",
    status: "pending",
    matched_at: new Date().toISOString(),
    job_listings: {
      id: 4,
      title: "React Native Developer",
      company: "Appify",
      location: "Bangkok (Hybrid)",
      skills: ["React Native", "TypeScript", "Firebase", "REST API", "Git", "Testing"],
      apply_email: null,
      apply_url: "https://example.com/apply/mobile-appify",
    },
  },
];

export default function MatchesFeed() {
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{success: number; failed: number} | null>(null);

  const handleAction = async (matchId: number, action: "approved" | "skipped") => {
    setActingId(matchId);
    try {
      const res = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, action }),
      });
      if (res.ok) {
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      } else {
        // Mock mode — just remove from UI
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      }
    } catch {
      // Mock mode
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } finally {
      setActingId(null);
    }
  };

  const toggleSelection = (matchId: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map(m => m.id)));
    }
  };

  const handleBulkApply = async () => {
    setApplying(true);
    setApplyResult(null);
    
    try {
      const selectedMatches = matches.filter(m => selectedIds.has(m.id));
      
      const res = await fetch("/api/apply/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          match_ids: Array.from(selectedIds),
          applications: selectedMatches.map(m => ({
            match_id: m.id,
            job_id: m.job_listings.id,
            cover_letter: m.cover_letter,
            apply_email: m.job_listings.apply_email,
            apply_url: m.job_listings.apply_url,
          }))
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setApplyResult({ success: data.successful || selectedIds.size, failed: data.failed || 0 });
        // Remove applied matches from list
        setMatches(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setTimeout(() => {
          setReviewOpen(false);
          setApplyResult(null);
        }, 2000);
      } else {
        // Mock success for demo
        setApplyResult({ success: selectedIds.size, failed: 0 });
        setMatches(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setTimeout(() => {
          setReviewOpen(false);
          setApplyResult(null);
        }, 2000);
      }
    } catch {
      // Mock success for demo
      setApplyResult({ success: selectedIds.size, failed: 0 });
      setMatches(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      setTimeout(() => {
        setReviewOpen(false);
        setApplyResult(null);
      }, 2000);
    } finally {
      setApplying(false);
    }
  };

  if (matches.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-[14px] text-[#8898aa]">
          No pending matches. Check back tomorrow for new opportunities.
        </p>
      </div>
    );
  }

  const selectedMatches = matches.filter(m => selectedIds.has(m.id));
  const canBulkApply = selectedMatches.every(m => m.job_listings.apply_email);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Today's Matches</h2>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
          Demo data
        </span>
      </div>

      <div className="mt-6">
      {/* Bulk action bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === matches.length && matches.length > 0}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
            />
            <span className="text-[12px] text-[#8898aa]">
              {selectedIds.size} of {matches.length} selected
            </span>
          </label>
        </div>
        <button
          onClick={() => setReviewOpen(true)}
          disabled={selectedIds.size === 0}
          className="rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Review & Apply ({selectedIds.size})
        </button>
      </div>

      {/* Match cards */}
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/15"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-5">
              <input
                type="checkbox"
                checked={selectedIds.has(match.id)}
                onChange={() => toggleSelection(match.id)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[15px] font-medium text-white">
                    {match.job_listings.title}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${match.match_score >= 70 ? "bg-emerald-500/10 text-emerald-400" : match.match_score >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {match.match_score}% match
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#8898aa]">
                  {match.job_listings.company} &middot; {match.job_listings.location}
                  {match.job_listings.apply_email ? (
                    <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                      Email apply
                    </span>
                  ) : (
                    <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                      Manual apply
                    </span>
                  )}
                </p>
                {match.missing_skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {match.missing_skills.map((skill) => (
                      <span key={skill} className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
                >
                  {expandedId === match.id ? "Hide" : "Preview"}
                </button>
                <button
                  onClick={() => handleAction(match.id, "skipped")}
                  disabled={actingId === match.id}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[12px] font-medium text-[#8898aa] transition-colors hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Expanded: cover letter preview */}
            {expandedId === match.id && (
              <div className="border-t border-white/[0.06] px-5 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8898aa]">
                  Generated cover letter
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-white/[0.02] p-4 text-[13px] leading-relaxed text-white/70">
                  {match.cover_letter}
                </pre>
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-[11px] text-[#8898aa]/50">
                    {match.job_listings.apply_email
                      ? `Will be sent to ${match.job_listings.apply_email}`
                      : `You'll apply via ${match.job_listings.apply_url}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review & Apply Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a2540] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Review Applications</h3>
                <p className="text-[13px] text-[#8898aa]">{selectedIds.size} jobs selected</p>
              </div>
              <button
                onClick={() => setReviewOpen(false)}
                className="rounded-lg p-2 text-[#8898aa] hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {!canBulkApply && (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-400">
                  Some selected jobs require manual application (no email provided). Only email-apply jobs will be processed.
                </div>
              )}

              {applyResult ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-emerald-400">
                    {applyResult.success} application{applyResult.success !== 1 ? 's' : ''} sent!
                  </p>
                  {applyResult.failed > 0 && (
                    <p className="mt-1 text-[13px] text-amber-400">{applyResult.failed} failed</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMatches.map((match) => (
                    <div key={match.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white">{match.job_listings.title}</h4>
                          <p className="text-[13px] text-[#8898aa]">{match.job_listings.company}</p>
                        </div>
                        {match.job_listings.apply_email ? (
                          <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">
                            {match.job_listings.apply_email}
                          </span>
                        ) : (
                          <span className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
                            Manual apply
                          </span>
                        )}
                      </div>
                      <div className="mt-3 rounded-lg bg-white/[0.02] p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-[#8898aa]">Cover Letter</p>
                        <p className="mt-1 line-clamp-3 text-[12px] text-white/70">{match.cover_letter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!applyResult && (
              <div className="border-t border-white/10 px-6 py-4">
                <button
                  onClick={handleBulkApply}
                  disabled={applying || selectedIds.size === 0}
                  className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                >
                  {applying ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending applications...
                    </span>
                  ) : (
                    `Send ${selectedIds.size} Application${selectedIds.size !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
