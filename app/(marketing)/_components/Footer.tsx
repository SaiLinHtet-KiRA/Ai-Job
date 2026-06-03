import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary" />
              <span className="font-semibold text-white">easy2apply</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[#8898aa]">
              AI-powered job search for modern job seekers.
            </p>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Tools</p>
            <ul className="space-y-2">
              <li><Link href="/cv-check" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">CV Score Checker</Link></li>
              <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Job Matching</Link></li>
              <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Bulk Apply</Link></li>
              <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Skill Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Account</p>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Sign In</Link></li>
              <li><Link href="/login" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Create Account</Link></li>
              <li><Link href="/dashboard" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Dashboard</Link></li>
              <li><Link href="/profile" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Your Profile</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">App</p>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Browse Jobs</Link></li>
              <li><Link href="/applications" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">My Applications</Link></li>
              <li><Link href="/roadmap" className="text-[13px] text-[#8898aa] transition-colors hover:text-white">Skill Roadmap</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-8 text-center">
          <p className="text-[13px] text-[#8898aa]">© 2026 easy2apply. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
