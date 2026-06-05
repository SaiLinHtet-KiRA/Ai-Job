"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from "react";
import LocationSelector from "@/components/LocationSelector";
import TitleSelector from "@/components/TitleSelector";

interface JobListingFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const inputClasses =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-primary dark:focus:bg-zinc-800";

const labelClasses =
  "flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function JobListingFormModal({ open, onClose, onCreated }: JobListingFormModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);

  const expiresDate = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/purity
      new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    [expiresInDays],
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setCompany("");
    setLocation("");
    setJobType("full-time");
    setSalaryRange("");
    setSkillsText("");
    setDescription("");
    setApplyUrl("");
    setApplyEmail("");
    setExpiresInDays(30);
    setError("");
  }, []);

  const prevOpen = useRef(false);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEsc);
      if (!prevOpen.current) {
        resetForm();
      }
      prevOpen.current = true;
    } else {
      prevOpen.current = false;
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleClose, resetForm]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!company.trim()) {
      setError("Company is required.");
      return;
    }

    setLoading(true);
    setError("");

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/job-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          location,
          job_type: jobType,
          salary_range: salaryRange,
          skills,
          description,
          apply_url: applyUrl,
          apply_email: applyEmail,
          source: "manual",
          expires_in_days: expiresInDays,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        resetForm();
        onCreated();
        onClose();
      } else {
        setError(data.error || "Failed to create job listing.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={modalRef}
        className="flex max-h-[92vh] w-full animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:max-w-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/60 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Insert Job Listing
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          id="job-listing-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-8"
        >
          <label className={labelClasses}>
            Title <span className="text-red-500">*</span>
            <TitleSelector value={title} onChange={(v) => { setTitle(v); setError(""); }} required />
          </label>

          <label className={labelClasses}>
            Company <span className="text-red-500">*</span>
            <input
              className={inputClasses}
              value={company}
              onChange={(e) => { setCompany(e.target.value); setError(""); }}
              placeholder="Acme Inc."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Location
              <LocationSelector value={location} onChange={setLocation} />
            </label>

            <label className={labelClasses}>
              Job Type
              <select
                className={inputClasses}
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Salary Range
              <input
                className={inputClasses}
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="$80k - $120k"
              />
            </label>

            <label className={labelClasses}>
              Skills{" "}
              <span className="text-xs font-normal text-zinc-400">(comma separated)</span>
              <input
                className={inputClasses}
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="React, TypeScript, Node.js"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Apply Email
              <input
                className={inputClasses}
                type="email"
                value={applyEmail}
                onChange={(e) => setApplyEmail(e.target.value)}
                placeholder="jobs@company.com"
              />
            </label>

            <label className={labelClasses}>
              Apply URL
              <input
                className={inputClasses}
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="https://company.com/jobs/123"
              />
            </label>
          </div>

          <label className={labelClasses}>
            Description
            <textarea
              className={`${inputClasses} min-h-[100px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role and responsibilities..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClasses}>
              Expires In (Days)
              <input
                className={inputClasses}
                type="number"
                min={1}
                max={365}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                placeholder={expiresDate}
              />
              <span className="text-xs text-zinc-400">
                Posted today &middot; Expires {expiresDate}
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 border-t border-zinc-200/60 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Insert Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
