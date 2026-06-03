import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import Link from "next/link";
import TopNav from "../components/TopNav";
import MatchesFeed from "./MatchesFeed";
import { Suspense } from "react";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id ?? session.user.email ?? "user",
    email: session.user.email ?? "",
  };
}

async function hasCV(): Promise<boolean> {
  // For demo: check if user has a CV uploaded
  // In production, query the user_cvs table
  return true; // Assume has CV for now
}

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userHasCV = await hasCV();

  return (
    <div className="min-h-screen bg-[#0a2540]">
      <TopNav />
      
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back, {user.email?.split("@")[0]}
            </h1>
            <p className="mt-1 text-[14px] text-[#8898aa]">
              Here&apos;s what&apos;s happening with your job search
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">New Matches</p>
              <p className="mt-2 text-3xl font-bold text-white">3</p>
              <p className="mt-1 text-[12px] text-emerald-400">+2 since yesterday</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">Applications Sent</p>
              <p className="mt-2 text-3xl font-bold text-white">12</p>
              <p className="mt-1 text-[12px] text-[#8898aa]">This month</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">Response Rate</p>
              <p className="mt-2 text-3xl font-bold text-white">25%</p>
              <p className="mt-1 text-[12px] text-emerald-400">Above average</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[12px] font-medium text-[#8898aa] uppercase">Profile Score</p>
              <p className="mt-2 text-3xl font-bold text-white">85</p>
              <p className="mt-1 text-[12px] text-[#8898aa]">Out of 100</p>
            </div>
          </div>

          {/* Main Content: B+C Hybrid Layout */}
          {userHasCV ? (
            <>
              {/* Option B: Has CV - Show Matches */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Top Matches</h2>
                  <p className="text-[13px] text-[#8898aa]">
                    Select jobs you want to apply to
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
                >
                  Browse All Jobs
                </Link>
              </div>
              <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />}>
                <MatchesFeed />
              </Suspense>
            </>
          ) : (
            /* Option C: No CV - Show Upload Prompt */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-16 px-6 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Upload Your CV to Get Started</h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[#8898aa]">
                Our AI will analyze your skills and experience to find your perfect job matches
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/profile"
                  className="rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-primary-dark"
                >
                  Upload CV
                </Link>
                <Link
                  href="/cv-check"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-white/[0.05]"
                >
                  Check CV Score First
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-[13px] text-[#8898aa]">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-Powered Matching
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  One-Click Apply
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track Progress
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/profile"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Update CV</p>
                <p className="text-[12px] text-[#8898aa]">Keep your profile fresh</p>
              </div>
            </Link>
            <Link
              href="/roadmap"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Skill Roadmap</p>
                <p className="text-[12px] text-[#8898aa]">Close your gaps</p>
              </div>
            </Link>
            <Link
              href="/applications"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">My Applications</p>
                <p className="text-[12px] text-[#8898aa]">Track progress</p>
              </div>
            </Link>
            <Link
              href="/jobs"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Browse Jobs</p>
                <p className="text-[12px] text-[#8898aa]">Explore all listings</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
