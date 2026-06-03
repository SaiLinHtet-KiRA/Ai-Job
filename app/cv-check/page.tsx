"use client";

import { useState, useRef, useCallback } from "react";
import CVCheckNav from "./_components/CVCheckNav";
import CVCheckHero from "./_components/CVCheckHero";
import UploadCard from "./_components/UploadCard";
import CVCheckResults from "./_components/CVCheckResults";
import SocialProofBar from "./_components/SocialProofBar";
import HowItWorksSection from "./_components/HowItWorksSection";
import FeaturesSection from "./_components/FeaturesSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import CVCheckFAQ from "./_components/CVCheckFAQ";
import { ScoreResult, MatchedJob } from "./_components/types";

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

  const validateFile = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) return "Please upload a PDF or Word (.docx) file.";
    if (f.size > MAX_SIZE) return "File is too large (max 5 MB).";
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setResult(null);
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
  }, [validateFile]);

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

  return (
    <div className="min-h-screen">
      <CVCheckNav />

      <section className="relative overflow-hidden bg-[#0a2540]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[400px] -right-[300px] h-[800px] w-[800px] rounded-full bg-[#635BFF]/20 blur-[120px]" />
          <div className="absolute -bottom-[200px] -left-[200px] h-[600px] w-[600px] rounded-full bg-[#00D4AA]/15 blur-[120px]" />
          <div className="absolute top-[200px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#80E9FF]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-36 sm:pb-32 sm:pt-44">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-slide-up">
              <CVCheckHero />
            </div>

            <div className="animate-slide-up">
              {!result ? (
                <UploadCard
                  file={file}
                  dragActive={dragActive}
                  error={error}
                  loading={loading}
                  fileInputRef={inputRef}
                  onFileDrop={handleDrop}
                  onFileSelect={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  onAnalyze={handleSubmit}
                  onDragOver={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                />
              ) : (
                <CVCheckResults
                  result={result}
                  email={email}
                  emailError={emailError}
                  emailSent={emailSent}
                  emailLoading={emailLoading}
                  matchedJobs={matchedJobs}
                  matchLoading={matchLoading}
                  onEmailChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                  onEmailSubmit={handleEmailSubmit}
                  onEmailKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                  onReset={resetState}
                />
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {!result && (
        <>
          <SocialProofBar />
          <HowItWorksSection />
          <FeaturesSection />
          <TestimonialsSection />
        </>
      )}

      <CVCheckFAQ />
    </div>
  );
}
