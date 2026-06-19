export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-white/5 bg-[#0d2b4a]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.5rem]">
            Get your CV score in under 10 seconds
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload your CV",
              desc: "Drag and drop your CV in PDF or Word format. No account needed — just your file.",
            },
            {
              step: "02",
              title: "AI analyzes instantly",
              desc: "Our AI scans your CV against ATS criteria — formatting, keywords, structure, and content depth.",
            },
            {
              step: "03",
              title: "Get actionable feedback",
              desc: "Receive your score plus specific strengths, weaknesses, and missing keywords you can fix today.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20"
            >
              <span className="text-[32px] font-bold text-white/10 group-hover:text-primary/30 transition-colors">
                {item.step}
              </span>
              <h3 className="mt-3 text-[16px] font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#8898aa]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
