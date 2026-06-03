export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
            Three steps. Instant results.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-[#425466]">
            No account required. No complicated process. Just upload and get answers.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-[#e6ebf1] bg-[#e6ebf1] sm:grid-cols-3">
          {[
            {
              num: "1",
              title: "Upload your CV",
              desc: "Drop a PDF or Word file. No signup, no forms — just your CV.",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              ),
            },
            {
              num: "2",
              title: "AI analyzes it",
              desc: "We extract the text and score it against ATS criteria used by real employers.",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              ),
            },
            {
              num: "3",
              title: "Get your score",
              desc: "See your ATS score, strengths, weaknesses, and missing keywords.",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
            },
          ].map((step) => (
            <div key={step.num} className="bg-white p-8 sm:p-10">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f9fc] text-primary">
                {step.icon}
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a2540]">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#425466]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
