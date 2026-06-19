"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeroSection() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative overflow-hidden px-6 py-16 lg:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[900px] w-[900px] rounded-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[700px] w-[700px] rounded-full bg-gradient-to-tr from-blue-500/10 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          AI-Powered Job Search Platform
        </div>

        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Land your next job
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
            10x faster with AI
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-[#8898aa]">
          Upload your CV once. Our AI scores it, finds your best-fit jobs, generates tailored cover letters, and lets you bulk apply — all in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="w-full rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
          >
            Get Started Free
          </Link>
          <Link
            href="/cv-check"
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-white transition-all hover:bg-white/[0.07] sm:w-auto"
          >
            Check CV Score — Free
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
          <div>
            <div className="text-3xl font-bold text-white">10k+</div>
            <div className="mt-1 text-[13px] text-[#8898aa]">Jobs Matched</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">85%</div>
            <div className="mt-1 text-[13px] text-[#8898aa]">Interview Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">3min</div>
            <div className="mt-1 text-[13px] text-[#8898aa]">To Apply</div>
          </div>
        </div>
      </div>
    </section>
  );
}
