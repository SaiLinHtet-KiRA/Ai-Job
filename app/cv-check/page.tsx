"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CVCheckHero from "./_components/CVCheckHero";
import UploadCard from "./_components/UploadCard";
import CVCheckResults from "./_components/CVCheckResults";
import SocialProofBar from "./_components/SocialProofBar";
import HowItWorksSection from "./_components/HowItWorksSection";
import FeaturesSection from "./_components/FeaturesSection";
import AboutUsSection from "./_components/AboutUsSection";
import CVCheckFAQ from "./_components/CVCheckFAQ";
import { ScoreResult } from "./_components/types";

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
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
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cv/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Something went wrong (${res.status})`);
      }
      const data = await res.json();
      setResult(data.score ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      <section className="relative overflow-hidden bg-[#0a2540]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[400px] -right-[300px] h-[800px] w-[800px] rounded-full bg-[#7C3AED]/25 blur-[120px]" />
          <div className="absolute -bottom-[200px] -left-[200px] h-[600px] w-[600px] rounded-full bg-[#06B6D4]/20 blur-[120px]" />
          <div className="absolute top-[200px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#F472B6]/15 blur-[100px]" />
        </div>

        <div className="absolute top-6 right-6 z-10 hidden items-center gap-3 sm:flex">
          {[
            { id: "how-it-works", label: "How it works" },
            { id: "features", label: "Features" },
            { id: "about-us", label: "About" },
            { id: "faq", label: "FAQ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              {item.label}
            </button>
          ))}
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
                <CVCheckResults result={result} />
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
          <AboutUsSection />
        </>
      )}

      <CVCheckFAQ />
    </div>
  );
}
