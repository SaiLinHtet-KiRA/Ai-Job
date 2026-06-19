"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function CVCheckNav() {
  const router = useRouter();

  return (
    <nav className="absolute top-0 left-0 right-0 z-40">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.avif" alt="easy2apply" width={32} height={32} className="h-8 w-8 rounded-lg" />
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-white">
              easy2apply
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("about-us")}
            className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block"
          >
            About
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block"
          >
            FAQ
          </button>
        </div>
      </div>
    </nav>
  );
}
