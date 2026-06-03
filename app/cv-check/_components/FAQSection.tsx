export default function FAQSection() {
  return (
    <section className="bg-[#f6f9fc]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#0a2540] sm:text-[2.5rem]">
            Common questions
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              q: "Is this really free?",
              a: "Yes — completely free. No hidden fees, no trial that expires. Upload your CV and get your score instantly.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can score your CV without signing up. We only ask for your email if you want to save your results or get job match notifications.",
            },
            {
              q: "What is an ATS score?",
              a: "ATS stands for Applicant Tracking System — software that employers use to filter CVs before a human ever sees them. Your ATS score tells you how likely your CV is to pass through those filters.",
            },
            {
              q: "Is my CV stored or shared?",
              a: "Your CV is analyzed in memory and never stored on our servers. We don't share your data with employers or anyone else without your explicit permission.",
            },
            {
              q: "What file formats are supported?",
              a: "We accept PDF and Word (.docx) files up to 5 MB. For best results, use a PDF with selectable text (not a scanned image).",
            },
            {
              q: "How accurate is the score?",
              a: "Our AI evaluates your CV against the same criteria used by real ATS systems — formatting, keywords, structure, and content. It's not a guarantee, but it's a strong indicator of how your CV will perform.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-[#e6ebf1] bg-white p-7"
            >
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a2540]">
                {faq.q}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#425466]">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
