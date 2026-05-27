"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ApplyModal from "@/components/ApplyModal";

const steps = [
  {
    num: "01",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    title: "Fill One Form",
    desc: "Enter your name, target position, and upload your resume. It takes 30 seconds — no signup, no hassle.",
  },
  {
    num: "02",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    title: "We Reach Employers",
    desc: "Your application is instantly shared with companies hiring for your role. No middlemen, no waiting.",
  },
  {
    num: "03",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "Unlock Your Roadmap",
    desc: "Get a personalized study roadmap with curated courses, time estimates, and project ideas tailored to your target role.",
  },
];

const perks = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Apply in Seconds",
    desc: "One form, one click. No account creation, no lengthy onboarding.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Direct to Employers",
    desc: "Your resume lands in front of hiring managers at companies actively recruiting.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "Personalized Roadmap",
    desc: "After applying, unlock a curated study path with courses, projects, and time estimates.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "100% Free",
    desc: "No hidden fees, no premium tiers. We believe access to jobs should be free for everyone.",
  },
];

const stats = [
  { value: "250+", label: "Open Positions" },
  { value: "50+", label: "Partner Companies" },
  { value: "500+", label: "Career Roadmaps" },
  { value: "24h", label: "Avg. Response Time" },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.avif" alt="easy2apply" width={36} height={36} className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary-dark to-[#004DD4] bg-clip-text text-transparent">
                easy2apply
              </span>
            </span>
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-primary to-primary-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/30 active:scale-95"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/10 via-primary-dark/10 to-[#004DD4]/10 blur-3xl dark:from-primary/5 dark:via-primary-dark/5 dark:to-[#004DD4]/5" />
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 text-center sm:pt-32">
          <div className="mb-8 inline-flex animate-slide-up items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary-dark backdrop-blur-sm dark:border-primary/40 dark:bg-primary/15 dark:text-primary/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-dark" />
            </span>
            NOW HIRING — 250+ OPEN POSITIONS
          </div>

          <h1 className="animate-slide-up text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            One Click.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-dark to-[#004DD4] bg-clip-text text-transparent">
              Infinite Possibilities.
            </span>
          </h1>

          <p className="animate-slide-up mx-auto mt-8 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Apply to hundreds of jobs with a single form. We send your profile
            directly to hiring managers, and you get a personalized study
            roadmap to crush your next interview.
          </p>

          <div className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setModalOpen(true)}
              className="group relative inline-flex h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-10 text-lg font-semibold text-white shadow-2xl shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/40 active:scale-[0.98] sm:w-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Start Your Application
            </button>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Free &bull; No account needed &bull; Takes 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            How It Works
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Three steps to your next job
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            No complicated signups. No endless forms. Just apply and get results.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((item, i) => (
            <div
              key={item.num}
              className="group relative rounded-3xl border border-zinc-200/60 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-4xl font-black tracking-tighter text-zinc-100 dark:text-zinc-800">
                  {item.num}
                </span>
                {i < 2 && (
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent sm:block dark:from-zinc-700" />
                )}
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary shadow-sm dark:from-primary/20 dark:to-accent/15 dark:text-primary/80">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why easy2apply ── */}
      <section className="bg-zinc-50/50 py-28 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Why easy2apply
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Everything you need
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              We handle the heavy lifting so you can focus on what matters — landing the job.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div
                key={p.title}
                className="group rounded-3xl border border-zinc-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary shadow-sm dark:from-primary/20 dark:to-accent/15 dark:text-primary/80">
                  {p.icon}
                </div>
                <h3 className="text-base font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-[#004DD4] p-px shadow-2xl shadow-primary/20">
          <div className="rounded-[2.45rem] bg-white px-8 py-16 text-center dark:bg-zinc-950 sm:px-16 sm:py-24">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ready to land your
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-dark to-[#004DD4] bg-clip-text text-transparent">
                dream job?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              One form. Hundreds of opportunities. A personalized roadmap. All free.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setModalOpen(true)}
                className="group relative inline-flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-12 text-lg font-semibold text-white shadow-2xl shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark hover:shadow-primary/40 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Apply Now — It&apos;s Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200/60 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center text-sm text-zinc-400 dark:text-zinc-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} easy2apply. All rights reserved.</p>
          <p>
            Built with{" "}
            <span className="text-red-500">&hearts;</span> for job seekers
            everywhere.
          </p>
        </div>
      </footer>

      <ApplyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
