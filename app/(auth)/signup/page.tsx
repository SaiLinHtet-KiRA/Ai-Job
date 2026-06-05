"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  // Step 1: signup form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2: code verification
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || null }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
      setLoading(false);
    } else {
      setStep("verify");
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError("");

    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Verification failed");
      setVerifying(false);
    } else {
      router.push("/login?success=Account verified. Please sign in.");
    }
  }

  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a2540] px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white">Check your email</h1>
            <p className="mt-2 text-[14px] text-[#8898aa]">
              We sent a 6-digit code to{" "}
              <span className="text-white">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4 text-left">
            <div>
              <label className="block text-[13px] font-medium text-[#8898aa] mb-1">
                Verification code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-[20px] tracking-[0.5em] text-white placeholder:text-[#5a6e80] outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full rounded-lg bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <button
            onClick={() => {
              setStep("form");
              setError("");
              setCode("");
            }}
            className="mt-4 text-[13px] text-[#8898aa] hover:text-white transition-colors"
          >
            Change email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a2540] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-[14px] text-[#8898aa]">
            Get started with AI-powered job matching
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <label className="block text-[13px] font-medium text-[#8898aa] mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white placeholder:text-[#5a6e80] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#8898aa] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white placeholder:text-[#5a6e80] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#8898aa] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white placeholder:text-[#5a6e80] outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending code..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[#8898aa]">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
