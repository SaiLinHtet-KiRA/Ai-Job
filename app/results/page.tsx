"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import roadmaps from "@/app/data/study-roadmaps.json";

interface Job {
  id: number;
  title: string;
  company: string;
  email: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  image_url: string;
  created_at: string;
}

interface RoadmapItem {
  courseName: string;
  source: string;
  timeInHours: number;
  projectIdea: string;
}

interface RoadmapEntry {
  title: string;
  roadmap: {
    title: string;
    items: RoadmapItem[];
    alternative?: {
      title: string;
      items: RoadmapItem[];
    };
  };
}

function ResultsContent() {
  const params = useSearchParams();
  const position = params.get("position") || "";
  const name = params.get("name") || "";

  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(
          `/api/jobs?title=${encodeURIComponent(position)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setMatchedJobs(data);
        }
      } catch {
        //
      }
      setLoading(false);
    }
    fetchJobs();
  }, [position]);

  const roadmap = (roadmaps as RoadmapEntry[]).find(
    (r) => r.title.toLowerCase() === position.toLowerCase(),
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

      <header className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Image src="/logo.avif" alt="easy2apply" width={32} height={32} className="h-8 w-8 rounded-lg" />
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              easy2apply
            </span>
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {name && (
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {name}
              </span>
            )}
            {position && (
              <>
                {" "}
                &mdash;{" "}
                <span className="font-semibold text-primary">{position}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Results
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {name ? `${name}, here's your match` : "Your match"}
          </h1>
          <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
            Showing {matchedJobs.length} job
            {matchedJobs.length !== 1 ? "s" : ""} matching{" "}
            <strong>{position}</strong>
          </p>
        </div>

        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Matched Jobs
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="h-6 w-6 animate-spin text-primary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">
                No jobs found matching &quot;{position}&quot;. Try a different
                position.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchedJobs.map((job) => (
                <div
                  key={job.id}
                  className="group rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  {job.image_url ? (
                    <div className="mb-4 h-40 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={job.image_url}
                        alt={job.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-3xl font-bold text-primary/30 dark:from-primary/20 dark:to-accent/15 dark:text-primary/30">
                      {job.title.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold tracking-tight">{job.title}</h3>
                  {job.company && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {job.company}
                    </p>
                  )}
                  {job.email && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {job.email}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {job.location && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {job.salary}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(job.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Study Roadmap
          </h2>
          {!roadmap ? (
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">
                No roadmap found for &quot;{position}&quot;. Here&apos;s a
                general IT roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                  {roadmap.roadmap.title}
                </span>
                <h3 className="mt-1 text-2xl font-bold">Learning Path</h3>
                <div className="mt-6 space-y-5">
                  {roadmap.roadmap.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-5 transition-all hover:border-primary/20 hover:bg-primary/10 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-primary/30 dark:hover:bg-primary/15"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          {item.courseName}
                        </a>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {item.timeInHours}h &middot; {item.projectIdea}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {roadmap.roadmap.alternative && (
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                  <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                    {roadmap.roadmap.alternative.title}
                  </span>
                  <h3 className="mt-1 text-2xl font-bold">Alternative Path</h3>
                  <div className="mt-6 space-y-5">
                    {roadmap.roadmap.alternative.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-5 transition-all hover:border-accent/30 hover:bg-accent/10/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-accent/30 dark:hover:bg-accent/10"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-bright text-xs font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-accent hover:underline"
                          >
                            {item.courseName}
                          </a>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.timeInHours}h &middot; {item.projectIdea}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
