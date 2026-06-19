"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import NotificationCenter from "./NotificationCenter";

export default function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const navLinkClass = (href: string) =>
    `text-[14px] transition-colors ${
      pathname.startsWith(href)
        ? "font-semibold text-white"
        : "text-[#8898aa] hover:text-white"
    }`;

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    await signOut({ redirect: false });
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    window.location.replace("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a2540]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
          <Image
            src="/logo.avif"
            alt="easy2apply"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
          />
          <span className="font-semibold text-white">easy2apply</span>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/jobs" className={navLinkClass("/jobs")}>
              Browse Jobs
            </Link>
            <Link href="/roadmap" className={navLinkClass("/roadmap")}>
              Courses
            </Link>
            <Link href="/cv-check" className={navLinkClass("/cv-check")}>
              CV Score
            </Link>
            <Link href="/applications" className={navLinkClass("/applications")}>
              Applications
            </Link>
            <Link href="/profile" className={navLinkClass("/profile")}>
              Profile
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <span className="hidden text-[13px] text-[#8898aa] sm:block">
                {session?.user?.email?.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] text-[#8898aa] hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-primary-dark"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
