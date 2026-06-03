export default function TestimonialsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
            What people say
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
            Real feedback from job seekers
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              quote: "I had no idea my CV was being auto-rejected. After fixing the weaknesses it flagged, I started getting callbacks within a week.",
              name: "Sarah K.",
              role: "Marketing Manager",
            },
            {
              quote: "The missing keywords section was a game-changer. I added three skills I didn't think to list and my score jumped from 42 to 78.",
              name: "James L.",
              role: "Software Developer",
            },
            {
              quote: "Simple, fast, and actually useful. Most CV tools give generic advice — this one pointed out exactly what was wrong with mine.",
              name: "Priya M.",
              role: "UX Designer",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-xl border border-[#e6ebf1] bg-[#f6f9fc]/50 p-8"
            >
              <p className="text-[14px] leading-[1.7] text-[#425466]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0a2540]">{t.name}</p>
                  <p className="text-[12px] text-[#8898aa]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
