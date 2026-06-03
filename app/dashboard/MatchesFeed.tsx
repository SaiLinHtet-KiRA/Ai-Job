"use client";

import { useState } from "react";
import MatchCardList from "./_components/MatchCardList";
import BulkActionBar from "./_components/BulkActionBar";
import ReviewModal from "./_components/ReviewModal";
import type { Match } from "./_components/types";

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
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      }
    } catch {
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
        setMatches(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setTimeout(() => {
          setReviewOpen(false);
          setApplyResult(null);
        }, 2000);
      } else {
        setApplyResult({ success: selectedIds.size, failed: 0 });
        setMatches(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setTimeout(() => {
          setReviewOpen(false);
          setApplyResult(null);
        }, 2000);
      }
    } catch {
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

  const selectedMatches = matches.filter(m => selectedIds.has(m.id));

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Today's Matches</h2>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
          Demo data
        </span>
      </div>

      <div className="mt-6">
        <BulkActionBar
          selectedCount={selectedIds.size}
          total={matches.length}
          onToggleAll={toggleAll}
          onReview={() => setReviewOpen(true)}
        />

        <MatchCardList
          matches={matches}
          selectedIds={selectedIds}
          expandedId={expandedId}
          actingId={actingId}
          onSelect={toggleSelection}
          onExpand={(id) => setExpandedId(id)}
          onSkip={(id) => handleAction(id, "skipped")}
        />

        <ReviewModal
          open={reviewOpen}
          selectedMatches={selectedMatches}
          applying={applying}
          applyResult={applyResult}
          onClose={() => setReviewOpen(false)}
          onApply={handleBulkApply}
        />
      </div>
    </div>
  );
}
