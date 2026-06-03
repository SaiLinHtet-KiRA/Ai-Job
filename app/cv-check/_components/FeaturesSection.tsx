export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#f6f9fc]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-accent">
            What you get
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
            Specific feedback, not generic advice
          </h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-[#425466]">
            Every result is tailored to your actual CV — not a template response.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              title: "ATS Score",
              desc: "A score from 0-100 that tells you exactly where your CV stands against automated screening systems. Most reject below 60.",
              tag: "0–100",
            },
            {
              title: "Strengths",
              desc: "Three specific things that are working well in your CV. These are the parts to keep and build on.",
              tag: "3 items",
            },
            {
              title: "Weaknesses",
              desc: "Three specific things to fix. Not vague advice — real changes you can make today to improve your score.",
              tag: "3 items",
            },
            {
              title: "Missing keywords",
              desc: "Real tools, skills, and qualifications that ATS systems scan for in your field. Add these to get past the filter.",
              tag: "Up to 8",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-[#e6ebf1] bg-white p-8 transition-all duration-300 hover:border-[#d3dce6] hover:shadow-md hover:shadow-[#0a2540]/[0.04]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a2540]">{f.title}</h3>
                <span className="rounded-full bg-[#f6f9fc] px-2.5 py-1 text-[11px] font-semibold text-[#8898aa]">{f.tag}</span>
              </div>
              <p className="text-[14px] leading-[1.65] text-[#425466]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
