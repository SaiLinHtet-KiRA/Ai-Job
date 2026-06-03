import Image from "next/image";
import FAQSection from "./FAQSection";

export default function CVCheckFAQ() {
  return (
    <>
      <FAQSection />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="overflow-hidden rounded-2xl bg-[#0a2540]">
            <div className="relative px-8 py-16 sm:px-16 sm:py-20">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/15 blur-[60px]" />

              <div className="relative max-w-lg">
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
                  Coming soon
                </p>
                <h2 className="mt-3 text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-[2rem]">
                  Job matching, learning roadmaps, and AI-powered CV tailoring.
                </h2>
                <p className="mt-4 text-[15px] leading-[1.7] text-[#8898aa]">
                  Score your CV today. Soon, we&apos;ll match you to real jobs and show you exactly how to close the gap.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-primary">
                  <span>Stay tuned</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e6ebf1] bg-white dark:border-white/10 dark:bg-[#0a2540]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.avif" alt="easy2apply" width={20} height={20} className="h-5 w-5 rounded" />
            <span className="text-[13px] text-[#8898aa]">
              &copy; {new Date().getFullYear()} easy2apply
            </span>
          </div>
          <p className="text-[13px] text-[#8898aa]">
            Built for job seekers everywhere.
          </p>
        </div>
      </footer>
    </>
  );
}
