"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const toolsLinks = [
    { href: "/cv-check", label: "CV Score Checker" },
    { href: isAuthenticated ? "/jobs" : "/login", label: "Job Matching" },
    { href: isAuthenticated ? "/applications" : "/login", label: "Bulk Apply" },
    { href: isAuthenticated ? "/roadmap" : "/login", label: "Skill Roadmap" },
  ];

  const accountLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Your Profile" },
        { href: "/applications", label: "My Applications" },
        { href: "/jobs", label: "Browse Jobs" },
      ]
    : [
        { href: "/login", label: "Sign In" },
        { href: "/login", label: "Create Account" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Your Profile" },
      ];
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.avif" alt="easy2apply" width={24} height={24} className="h-6 w-6 rounded-lg" />
              <span className="font-semibold text-white">easy2apply</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[#8898aa]">
              AI-powered job search for modern job seekers.
            </p>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Tools</p>
            <ul className="space-y-2">
              {toolsLinks.map((link) => (
                <li key={link.label}><Link href={link.href} className="text-[13px] text-[#8898aa] transition-colors hover:text-white">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#8898aa]">Account</p>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}><Link href={link.href} className="text-[13px] text-[#8898aa] transition-colors hover:text-white">{link.label}</Link></li>
              ))}
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
