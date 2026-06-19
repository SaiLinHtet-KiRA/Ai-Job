export default function FAQSection() {
  return (
    <section id="faq" className="border-t border-white/5 bg-[#0d2b4a]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.5rem]">
            Common questions
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              q: "Is this really free?",
              a: "Yes — completely free. No hidden fees, no trial that expires. Upload your CV and get your score instantly, no credit card required.",
            },
            {
              q: "Do I need to create an account?",
              a: "No account needed to score your CV. You only sign up if you want to get matched with jobs, build a skill roadmap, or apply to positions.",
            },
            {
              q: "What is an ATS score?",
              a: "ATS stands for Applicant Tracking System — software used by 99% of Fortune 500 companies to filter CVs before a recruiter ever sees them. Your ATS score predicts how well your CV will pass these automated filters.",
            },
            {
              q: "Is my CV data secure?",
              a: "Absolutely. Your CV is processed in memory and never permanently stored. We use enterprise-grade encryption and never share your data with anyone without your explicit consent.",
            },
            {
              q: "What file formats do you support?",
              a: "We accept PDF and Word (.docx) files up to 5 MB. For the most accurate results, use a text-based PDF — scanned images won't work.",
            },
            {
              q: "How can I improve my score?",
              a: "After scanning, you'll get a detailed breakdown of your strengths, weaknesses, and missing keywords. Follow those suggestions, re-upload, and watch your score climb. Most users improve by 15+ points on their second scan.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-white/20"
            >
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                {faq.q}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#8898aa]">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
