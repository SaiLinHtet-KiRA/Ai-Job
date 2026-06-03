import Image from "next/image";
import Link from "next/link";

export default function CVCheckNav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-40">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.avif" alt="easy2apply" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span className="text-[17px] font-semibold tracking-[-0.01em] text-white">
            easy2apply
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block">
            How it works
          </a>
          <a href="#features" className="hidden text-[13px] font-medium text-white/60 transition-colors hover:text-white sm:block">
            Features
          </a>
        </div>
      </div>
    </nav>
  );
}
