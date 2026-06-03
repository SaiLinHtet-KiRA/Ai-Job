export default function SocialProofBar() {
  return (
    <section className="border-b border-[#e6ebf1] bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
        {[
          { value: "10K+", label: "CVs analyzed" },
          { value: "73%", label: "improved their score" },
          { value: "8 sec", label: "average analysis time" },
          { value: "4.8/5", label: "user satisfaction" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0a2540]">
              {stat.value}
            </p>
            <p className="mt-1 text-[13px] text-[#8898aa]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
