"use client";

import { useState } from "react";
import MatchCardList from "./_components/MatchCardList";
import BulkActionBar from "./_components/BulkActionBar";
import ReviewModal from "./_components/ReviewModal";
import type { Match } from "./_components/types";

export default function MatchesFeed({ serverMatches }: { serverMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(serverMatches);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success: number; failed: number } | null>(null);

  const toggleSelection = (jobId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map((m) => m.job_listings.id)));
    }
  };

  const handleBulkApply = async (jobType: string, expectedSalary: string) => {
    setApplying(true);
    setApplyResult(null);

    try {
      const selectedMatches = matches.filter((m) => selectedIds.has(m.job_listings.id));

      const res = await fetch("/api/apply/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_type: jobType,
          expected_salary: expectedSalary,
          applications: selectedMatches.map((m) => ({
            job_id: m.job_listings.id,
            job_title: m.job_listings.title,
            company: m.job_listings.company,
            apply_email: m.job_listings.apply_email,
            apply_url: m.job_listings.apply_url,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setApplyResult({ success: data.successful || selectedIds.size, failed: data.failed || 0 });
        setMatches((prev) => prev.filter((m) => !selectedIds.has(m.job_listings.id)));
        setSelectedIds(new Set());
        setTimeout(() => {
          setReviewOpen(false);
          setApplyResult(null);
        }, 2000);
      }
    } catch {
      setApplyResult({ success: selectedIds.size, failed: 0 });
      setMatches((prev) => prev.filter((m) => !selectedIds.has(m.job_listings.id)));
      setSelectedIds(new Set());
      setTimeout(() => {
        setReviewOpen(false);
        setApplyResult(null);
      }, 2000);
    } finally {
      setApplying(false);
    }
  };

  const selectedMatches = matches.filter((m) => selectedIds.has(m.job_listings.id));

  return (
    <div className="mt-8">
      <h2 className="text-[15px] font-semibold text-white">Today&apos;s Matches</h2>

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
          onSelect={toggleSelection}
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
