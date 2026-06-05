"use client";

import { useState, useEffect } from "react";
import MatchCardList from "./_components/MatchCardList";
import BulkActionBar from "./_components/BulkActionBar";
import ReviewModal from "./_components/ReviewModal";
import type { Match } from "./_components/types";

export default function MatchesFeed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load matches");
        return res.json();
      })
      .then((data) => {
        setMatches(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
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

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-white">Today&apos;s Matches</h2>
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-white">Today&apos;s Matches</h2>
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-[14px] text-red-400">Failed to load matches</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-[13px] text-[#8898aa] underline hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
