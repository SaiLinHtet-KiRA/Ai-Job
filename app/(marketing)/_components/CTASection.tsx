import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 px-6 py-28">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-purple-500/5 to-blue-500/8" />
        <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to find your next job?
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-[#8898aa]">
          Start with a free CV score — no account needed. When you&apos;re ready, sign up and get matched with your perfect role.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
          >
            Create Free Account
          </Link>
          <Link
            href="/cv-check"
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-8 py-4 text-[15px] font-medium text-white transition-all hover:bg-white/[0.07] sm:w-auto"
          >
            Check CV Score First
          </Link>
        </div>
      </div>
    </section>
  );
}
