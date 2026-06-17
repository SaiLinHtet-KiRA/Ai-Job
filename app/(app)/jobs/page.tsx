"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LocationSelector from "@/components/LocationSelector";
import { Pagination } from "@/components/ui/Pagination";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  skills: string[];
  description: string;
  apply_url: string | null;
  apply_email: string | null;
}

interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildQuery(search: string, location: string, type: string, page: number, limit: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (location) params.set("location", location);
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return params.toString();
}

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQ = searchParams.get("search") ?? "";
  const locationQ = searchParams.get("location") ?? "";
  const typeQ = searchParams.get("type") ?? "";
  const pageQ = parseInt(searchParams.get("page") ?? "1", 10);
  const limitQ = parseInt(searchParams.get("limit") ?? "10", 10);

  const [search, setSearch] = useState(searchQ);
  const [location, setLocation] = useState(locationQ);
  const [type, setType] = useState(typeQ);
  const [limit, setLimit] = useState(limitQ);

  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = buildQuery(searchQ, locationQ, typeQ, pageQ, limitQ);
        router.replace(`/jobs?${qs}`, { scroll: false });

        const res = await fetch(`/api/job-listings?${qs}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load jobs");
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [searchQ, locationQ, typeQ, pageQ, limitQ, router, retryKey]);

  const applyFilters = () => {
    router.push(`/jobs?${buildQuery(search, location, type, 1, limit)}`);
  };

  const handleApply = (job: Job) => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (job.apply_url) {
      window.open(job.apply_url, "_blank");
    } else if (job.apply_email) {
      alert(`Apply via email: ${job.apply_email}`);
    }
  };

  const goToPage = (p: number) => {
    router.push(`/jobs?${buildQuery(search, location, type, p, limit)}`);
  };

  const changeLimit = (l: number) => {
    setLimit(l);
    router.push(`/jobs?${buildQuery(search, location, type, 1, l)}`);
  };

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Browse Jobs</h1>
            <p className="mt-1 text-[14px] text-[#8898aa]">
              {data ? `${data.total} jobs found` : "Loading..."}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#8898aa]">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Job title or company..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white placeholder-white/30 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#8898aa]">Location</label>
              <LocationSelector value={location} onChange={setLocation} allowCreate={false} />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#8898aa]">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-primary [&>option]:bg-[#0a2540]"
              >
                <option value="">All types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={applyFilters}
              className="rounded-lg bg-primary px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-[14px] text-red-400">{error}</p>
              <button onClick={() => setRetryKey((k) => k + 1)} className="mt-2 text-[13px] text-[#8898aa] underline">
                Retry
              </button>
            </div>
          ) : data && data.data.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-[14px] text-[#8898aa]">No jobs found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data?.data.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/15"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-medium text-white">{job.title}</h3>
                        <p className="mt-1 text-[13px] text-[#8898aa]">
                          {job.company} &middot; {job.location}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded bg-white/5 px-2 py-1 text-[11px] text-[#8898aa]">
                            {job.job_type}
                          </span>
                          {job.salary_range && (
                            <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">
                              {job.salary_range}
                            </span>
                          )}
                          {job.apply_email ? (
                            <span className="rounded bg-primary/10 px-2 py-1 text-[11px] text-primary">Email apply</span>
                          ) : (
                            <span className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">External apply</span>
                          )}
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.skills.slice(0, 6).map((skill) => (
                              <span
                                key={skill}
                                className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-[#8898aa]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {job.description && (
                          <p className="mt-3 line-clamp-2 text-[13px] text-[#8898aa]">{job.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleApply(job)}
                        className="rounded-lg bg-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-primary-dark"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 0 && (
                <div className="mt-8">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-[#8898aa]">
                      <span>
                        Showing {data.data.length > 0 ? (data.page - 1) * data.limit + 1 : 0}–{Math.min(data.page * data.limit, data.total)} of {data.total}
                      </span>
                      <select
                        value={limit}
                        onChange={(e) => changeLimit(Number(e.target.value))}
                        className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[12px] text-white outline-none [&>option]:bg-[#0a2540]"
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                    </div>

                    <Pagination
                      variant="dark"
                      page={data.page}
                      totalPages={data.totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
