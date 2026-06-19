export default function AboutUsSection() {
  return (
    <section id="about-us" className="border-t border-white/5 bg-[#0a2540]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
              About us
            </p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.5rem]">
              We believe job hunting should be smarter, not harder
            </h2>
            <p className="mt-6 text-[16px] leading-[1.7] text-[#8898aa]">
              easy2apply was built by people who&apos;ve been on both sides of the hiring table — as applicants who sent hundreds of CVs into the void, and as recruiters who used ATS tools to filter them.
            </p>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#8898aa]">
              We saw a broken system: talented people rejected by algorithms, not humans. So we built the tool we wished we had — an AI that helps you beat the bots and get your CV in front of real people.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: "2024", label: "Founded" },
                { value: "10K+", label: "CVs analyzed" },
                { value: "Remote", label: "Team" },
                { value: "100%", label: "Free core tool" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[12px] text-[#8898aa]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "AI-first approach",
                desc: "We use the latest language models to analyze your CV against real hiring criteria — not template matching.",
              },
              {
                title: "Privacy by design",
                desc: "Your data is processed in memory and never sold. We believe your job search is your business.",
              },
              {
                title: "Built for everyone",
                desc: "Whether you're a new grad or a senior engineer, our tools adapt to your level and target role.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-[15px] font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-[#8898aa]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
