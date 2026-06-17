"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import NotificationCenter from "./NotificationCenter";

export default function TopNav() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleSignOut = async () => {
    console.log("dasdasd");
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    await signOut({ redirect: false });
    router.push("/");
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
            <Link
              href="/dashboard"
              className="text-[14px] text-[#8898aa] hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className="text-[14px] text-[#8898aa] hover:text-white transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/applications"
              className="text-[14px] text-[#8898aa] hover:text-white transition-colors"
            >
              Applications
            </Link>
            <Link
              href="/profile"
              className="text-[14px] text-[#8898aa] hover:text-white transition-colors"
            >
              Profile
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
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
                href="/cv-check"
                className="hidden text-[14px] text-[#8898aa] hover:text-white transition-colors sm:block"
              >
                CV Score
              </Link>
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
