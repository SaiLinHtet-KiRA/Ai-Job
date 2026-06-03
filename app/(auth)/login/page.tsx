"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a2540] px-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-[14px] text-[#8898aa]">
            Sign in to access your job matches and applications
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400">
            <p className="font-medium">Auth Error: {error}</p>
            <p className="mt-1 text-[12px]">Check Auth0 callback URL settings</p>
          </div>
        )}

        {/* Auth0 Login Button */}
        <button
          onClick={() => signIn("auth0", { callbackUrl: "/dashboard" })}
          className="group flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-[14px] font-semibold text-[#0a2540] transition-all hover:bg-white/90"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
          </svg>
          Continue with Auth0
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[12px] text-[#8898aa]">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* CV Check Link */}
        <Link
          href="/cv-check"
          className="block w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] font-medium text-white transition-all hover:bg-white/[0.05]"
        >
          Check your CV score
        </Link>

        <p className="mt-6 text-[13px] text-[#8898aa]">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a2540] px-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
