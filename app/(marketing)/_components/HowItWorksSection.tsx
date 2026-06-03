import Link from "next/link";

export default function HowItWorksSection() {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Your full job search, in one place</h2>
          <p className="mt-4 text-[16px] text-[#8898aa]">From CV to offer — every step covered</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Upload CV",
              description: "Upload your CV to your profile. AI extracts your skills, experience, and preferences automatically.",
              href: "/login",
              cta: "Go to Profile",
              color: "from-primary/20 to-primary/5",
              border: "border-primary/20",
              icon: (
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Browse Jobs",
              description: "AI matches your profile with thousands of jobs. Filter by role, salary, and location.",
              href: "/login",
              cta: "Browse Jobs",
              color: "from-blue-500/20 to-blue-500/5",
              border: "border-blue-500/20",
              icon: (
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Smart Apply",
              description: "Select jobs and apply in bulk. AI writes a tailored cover letter for each application.",
              href: "/login",
              cta: "Start Applying",
              color: "from-emerald-500/20 to-emerald-500/5",
              border: "border-emerald-500/20",
              icon: (
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              ),
            },
            {
              step: "04",
              title: "Track Progress",
              description: "See every application's status in one dashboard. Know exactly where you stand.",
              href: "/login",
              cta: "View Tracker",
              color: "from-purple-500/20 to-purple-500/5",
              border: "border-purple-500/20",
              icon: (
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-6 transition-all hover:scale-[1.02]`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-white/20">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#8898aa]">{item.description}</p>
              <Link
                href={item.href}
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
              >
                {item.cta}
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
