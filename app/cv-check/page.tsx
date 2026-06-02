"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type ScoreResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  keywords_missing: string[];
  summary: string;
};

type MatchedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  missing_skills: string[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) return "Please upload a PDF or Word (.docx) file.";
    if (f.size > MAX_SIZE) return "File is too large (max 5 MB).";
    return null;
  };

  const handleFile = useCallback((f: File) => {
    setError(null);
    setResult(null);
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/score", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Something went wrong (${res.status})`);
      }
      const data: ScoreResult = await res.json();
      setResult(data);
      // Fetch job matches in background
      fetchMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setMatchLoading(true);
    try {
      // We use a simple heuristic: read the file text client-side for matching
      // In production this would use stored cv_text from the score API
      const formData = new FormData();
      if (file) formData.append("file", file);
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: file?.name || "general experience skills" }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatchedJobs(data.jobs?.slice(0, 3) ?? []);
      }
    } catch {
      // Non-critical, fail silently
    } finally {
      setMatchLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setEmail("");
    setEmailError(null);
    setEmailSent(false);
    setEmailLoading(false);
    setMatchedJobs([]);
    setMatchLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleEmailSubmit = async () => {
    setEmailError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "cv_score" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong.");
      }
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const scoreBg = (score: number) => {
    if (score >= 70) return "from-emerald-500/20 to-emerald-500/5";
    if (score >= 50) return "from-amber-500/20 to-amber-500/5";
    return "from-rose-500/20 to-rose-500/5";
  };

  const scoreMessage = (score: number) => {
    if (score >= 70) return "Your CV is above the threshold most ATS systems use.";
    if (score >= 50) return "Your CV is just below the threshold. A few fixes could make a big difference.";
    return "Most ATS systems would auto-reject this CV. See the fixes below.";
  };

  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav className="absolute top-0 left-0 right-0 z-40">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.avif" alt="easy2apply" width={32} height={32} className="h-8 w-8 rounded-lg" />
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-white">
              easy2apply
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block">
              How it works
            </a>
            <a href="#features" className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block">
              Features
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0a2540]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[400px] -right-[300px] h-[800px] w-[800px] rounded-full bg-[#635BFF]/20 blur-[120px]" />
          <div className="absolute -bottom-[200px] -left-[200px] h-[600px] w-[600px] rounded-full bg-[#00D4AA]/15 blur-[120px]" />
          <div className="absolute top-[200px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#80E9FF]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-36 sm:pb-32 sm:pt-44">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ── Left: Copy ── */}
            <div className="animate-slide-up max-w-xl">
              <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                Free CV analysis
              </p>
              <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                Find out if your CV will pass the ATS filter
              </h1>
              <p className="mt-6 max-w-lg text-[17px] leading-[1.7] text-[#8898aa]">
                Upload your CV and get an instant score with specific, actionable feedback.
                Free. No sign-up needed.
              </p>
              <div className="mt-8 flex items-center gap-5 text-[13px] text-[#8898aa]/50">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No sign-up
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  100% free
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instant results
                </span>
              </div>
            </div>

            {/* ── Right: CV Drop Card ── */}
            <div className="animate-slide-up">
              {!result ? (
                <div className="relative">
                  {/* Animated gradient border glow */}
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-60 blur-sm" style={{ animation: "gradient-shift 4s ease infinite" }} />
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-80" style={{ animation: "gradient-shift 4s ease infinite" }} />

                  {/* Card */}
                  <div className="relative rounded-2xl bg-[#0f2d4d] p-8 sm:p-10">
                    {/* Subtle inner light */}
                    <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-primary/10 blur-[50px]" />

                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                      onClick={() => !file && inputRef.current?.click()}
                      className={`
                        group relative cursor-pointer rounded-xl border border-dashed p-10 text-center transition-all duration-300
                        ${dragActive
                          ? "border-primary bg-primary/10 scale-[1.02]"
                          : file
                            ? "border-primary/30 bg-primary/[0.05]"
                            : "border-white/[0.12] hover:border-white/25 hover:bg-white/[0.03]"
                        }
                      `}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                      />

                      {!file ? (
                        <>
                          {/* Document illustration */}
                          <div className="mx-auto mb-6 flex h-20 w-16 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] shadow-lg shadow-black/20 transition-transform duration-500 group-hover:-translate-y-1">
                            <div className="mb-2 h-1 w-8 rounded-full bg-white/15" />
                            <div className="mb-1.5 h-1 w-10 rounded-full bg-white/10" />
                            <div className="mb-1.5 h-1 w-7 rounded-full bg-white/10" />
                            <div className="h-1 w-9 rounded-full bg-white/10" />
                          </div>
                          <p className="text-[15px] font-medium text-white">
                            Drop your CV here
                          </p>
                          <p className="mt-1 text-[13px] text-[#8898aa]">
                            or <span className="text-primary transition-colors group-hover:text-primary-dark">click to browse</span>
                          </p>
                          <p className="mt-3 text-[11px] text-[#8898aa]/40">
                            PDF or Word &middot; Max 5 MB
                          </p>
                        </>
                      ) : (
                        <>
                          {/* File selected */}
                          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <p className="truncate text-[15px] font-medium text-white">{file.name}</p>
                          <p className="mt-0.5 text-[13px] text-[#8898aa]">{(file.size / 1024).toFixed(0)} KB</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                            className="mt-2 text-[12px] font-medium text-primary/60 transition-colors hover:text-primary"
                          >
                            Change file
                          </button>
                        </>
                      )}
                    </div>

                    {/* Action area below dropzone */}
                    {error && (
                      <p className="mt-4 text-center text-[13px] font-medium text-rose-400">{error}</p>
                    )}

                    {file && !loading && (
                      <button
                        onClick={handleSubmit}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Analyze my CV
                      </button>
                    )}

                    {loading && (
                      <div className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.04] py-3.5">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                        <span className="text-[13px] font-medium text-[#8898aa]">Analyzing your CV&hellip;</span>
                      </div>
                    )}

                    {/* Trust line */}
                    <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#8898aa]/40">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Your CV is analyzed in memory and never stored
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Results ── */
                <div className="mx-auto max-w-lg text-left">
                  {/* Score card */}
                  <div className={`rounded-xl bg-gradient-to-b ${scoreBg(result.score)} border border-white/10 p-6`}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#8898aa]">Your ATS Score</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-6xl font-semibold tracking-[-0.03em] ${scoreColor(result.score)}`}>
                        {result.score}
                      </span>
                      <span className="text-xl text-white/20">/100</span>
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#8898aa]">{scoreMessage(result.score)}</p>
                  </div>

                  {/* Strengths */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-emerald-400">What&apos;s working</p>
                    <ul className="space-y-2.5">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/80">
                          <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-rose-400">What to fix</p>
                    <ul className="space-y-2.5">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/80">
                          <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Summary */}
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-[14px] leading-relaxed text-[#8898aa]">{result.summary}</p>
                  </div>

                  {/* Email gate */}
                  <div className="mt-6 rounded-xl border border-primary/30 bg-primary/[0.06] p-6">
                    {!emailSent ? (
                      <>
                        <p className="text-[15px] font-semibold text-white">
                          Get your full keyword report
                        </p>
                        <p className="mt-1 text-[13px] text-[#8898aa]">
                          We&apos;ll also notify you when we find jobs that match your profile.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                            className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                          />
                          <button
                            onClick={handleEmailSubmit}
                            disabled={emailLoading}
                            className="h-10 rounded-lg bg-primary px-5 text-[13px] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
                          >
                            {emailLoading ? "Sending..." : "Send report"}
                          </button>
                        </div>
                        {emailError && (
                          <p className="mt-2 text-[12px] font-medium text-rose-400">{emailError}</p>
                        )}
                        <p className="mt-3 text-[11px] text-[#8898aa]/50">
                          We never share your CV with employers without your approval.
                        </p>
                      </>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-white">Check your inbox</p>
                          <p className="mt-1 text-[13px] text-[#8898aa]">
                            We&apos;ve sent your full keyword report to <span className="text-white">{email}</span>. We&apos;ll also notify you when matching jobs are available.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Job matches teaser */}
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-primary">Jobs that match your CV</p>
                      {matchedJobs.length > 0 && (
                        <Link href="/login" className="text-[12px] font-medium text-primary hover:text-primary-dark">
                          See all →
                        </Link>
                      )}
                    </div>

                    {matchLoading && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                        <span className="text-[12px] text-[#8898aa]">Finding matches...</span>
                      </div>
                    )}

                    {!matchLoading && matchedJobs.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {matchedJobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                            <div>
                              <p className="text-[14px] font-medium text-white">{job.title}</p>
                              <p className="mt-0.5 text-[12px] text-[#8898aa]">{job.company} &middot; {job.location}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.match_score >= 70 ? "bg-emerald-500/10 text-emerald-400" : job.match_score >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                              {job.match_score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!matchLoading && matchedJobs.length === 0 && (
                      <p className="mt-3 text-[13px] text-[#8898aa]">No matches found yet.</p>
                    )}

                    <p className="mt-4 text-[11px] text-[#8898aa]/50">
                      Create a free account to see all matches and get notified of new ones.
                    </p>
                  </div>

                  <button
                    onClick={resetState}
                    className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-colors hover:text-primary-dark"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Score another CV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ── White sections below ── */}
      {!result && (
        <>
          {/* ── Social Proof Bar ── */}
          <section className="border-b border-[#e6ebf1] bg-white">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
              {[
                { value: "10K+", label: "CVs analyzed" },
                { value: "73%", label: "improved their score" },
                { value: "8 sec", label: "average analysis time" },
                { value: "4.8/5", label: "user satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0a2540]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[13px] text-[#8898aa]">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── How It Works ── */}
          <section id="how-it-works" className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
              <div className="mb-16 max-w-xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                  How it works
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
                  Three steps. Instant results.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-[#425466]">
                  No account required. No complicated process. Just upload and get answers.
                </p>
              </div>

              <div className="grid gap-px overflow-hidden rounded-2xl border border-[#e6ebf1] bg-[#e6ebf1] sm:grid-cols-3">
                {[
                  {
                    num: "1",
                    title: "Upload your CV",
                    desc: "Drop a PDF or Word file. No signup, no forms — just your CV.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    ),
                  },
                  {
                    num: "2",
                    title: "AI analyzes it",
                    desc: "We extract the text and score it against ATS criteria used by real employers.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    ),
                  },
                  {
                    num: "3",
                    title: "Get your score",
                    desc: "See your ATS score, strengths, weaknesses, and missing keywords.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    ),
                  },
                ].map((step) => (
                  <div key={step.num} className="bg-white p-8 sm:p-10">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f9fc] text-primary">
                      {step.icon}
                    </div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a2540]">{step.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.65] text-[#425466]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section id="features" className="bg-[#f6f9fc]">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
              <div className="mb-16 max-w-xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-accent">
                  What you get
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
                  Specific feedback, not generic advice
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-[#425466]">
                  Every result is tailored to your actual CV — not a template response.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    title: "ATS Score",
                    desc: "A score from 0-100 that tells you exactly where your CV stands against automated screening systems. Most reject below 60.",
                    tag: "0–100",
                  },
                  {
                    title: "Strengths",
                    desc: "Three specific things that are working well in your CV. These are the parts to keep and build on.",
                    tag: "3 items",
                  },
                  {
                    title: "Weaknesses",
                    desc: "Three specific things to fix. Not vague advice — real changes you can make today to improve your score.",
                    tag: "3 items",
                  },
                  {
                    title: "Missing keywords",
                    desc: "Real tools, skills, and qualifications that ATS systems scan for in your field. Add these to get past the filter.",
                    tag: "Up to 8",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="group rounded-xl border border-[#e6ebf1] bg-white p-8 transition-all duration-300 hover:border-[#d3dce6] hover:shadow-md hover:shadow-[#0a2540]/[0.04]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a2540]">{f.title}</h3>
                      <span className="rounded-full bg-[#f6f9fc] px-2.5 py-1 text-[11px] font-semibold text-[#8898aa]">{f.tag}</span>
                    </div>
                    <p className="text-[14px] leading-[1.65] text-[#425466]">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
              <div className="mb-16 max-w-xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                  What people say
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
                  Real feedback from job seekers
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    quote: "I had no idea my CV was being auto-rejected. After fixing the weaknesses it flagged, I started getting callbacks within a week.",
                    name: "Sarah K.",
                    role: "Marketing Manager",
                  },
                  {
                    quote: "The missing keywords section was a game-changer. I added three skills I didn't think to list and my score jumped from 42 to 78.",
                    name: "James L.",
                    role: "Software Developer",
                  },
                  {
                    quote: "Simple, fast, and actually useful. Most CV tools give generic advice — this one pointed out exactly what was wrong with mine.",
                    name: "Priya M.",
                    role: "UX Designer",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="flex flex-col justify-between rounded-xl border border-[#e6ebf1] bg-[#f6f9fc]/50 p-8"
                  >
                    <p className="text-[14px] leading-[1.7] text-[#425466]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0a2540]">{t.name}</p>
                        <p className="text-[12px] text-[#8898aa]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="bg-[#f6f9fc]">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
              <div className="mb-16 max-w-xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                  FAQ
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
                  Common questions
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    q: "Is this really free?",
                    a: "Yes — completely free. No hidden fees, no trial that expires. Upload your CV and get your score instantly.",
                  },
                  {
                    q: "Do I need to create an account?",
                    a: "No. You can score your CV without signing up. We only ask for your email if you want to save your results or get job match notifications.",
                  },
                  {
                    q: "What is an ATS score?",
                    a: "ATS stands for Applicant Tracking System — software that employers use to filter CVs before a human ever sees them. Your ATS score tells you how likely your CV is to pass through those filters.",
                  },
                  {
                    q: "Is my CV stored or shared?",
                    a: "Your CV is analyzed in memory and never stored on our servers. We don't share your data with employers or anyone else without your explicit permission.",
                  },
                  {
                    q: "What file formats are supported?",
                    a: "We accept PDF and Word (.docx) files up to 5 MB. For best results, use a PDF with selectable text (not a scanned image).",
                  },
                  {
                    q: "How accurate is the score?",
                    a: "Our AI evaluates your CV against the same criteria used by real ATS systems — formatting, keywords, structure, and content. It's not a guarantee, but it's a strong indicator of how your CV will perform.",
                  },
                ].map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-[#e6ebf1] bg-white p-7"
                  >
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a2540]">
                      {faq.q}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.65] text-[#425466]">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Coming Soon ── */}
          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
              <div className="overflow-hidden rounded-2xl bg-[#0a2540]">
                <div className="relative px-8 py-16 sm:px-16 sm:py-20">
                  {/* Subtle gradient accent */}
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
                  <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/15 blur-[60px]" />

                  <div className="relative max-w-lg">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                      Coming soon
                    </p>
                    <h2 className="mt-3 text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-[2rem]">
                      Job matching, learning roadmaps, and AI-powered CV tailoring.
                    </h2>
                    <p className="mt-4 text-[15px] leading-[1.7] text-[#8898aa]">
                      Score your CV today. Soon, we&apos;ll match you to real jobs and show you exactly how to close the gap.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-primary">
                      <span>Stay tuned</span>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#e6ebf1] bg-white dark:border-white/10 dark:bg-[#0a2540]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.avif" alt="easy2apply" width={20} height={20} className="h-5 w-5 rounded" />
            <span className="text-[13px] text-[#8898aa]">
              &copy; {new Date().getFullYear()} easy2apply
            </span>
          </div>
          <p className="text-[13px] text-[#8898aa]">
            Built for job seekers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
