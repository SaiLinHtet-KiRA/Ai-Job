"use client";

import { usePathname } from "next/navigation";
import Footer from "../(marketing)/_components/Footer";

const NO_FOOTER_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

export default function FooterWrapper() {
  const pathname = usePathname();

  if (NO_FOOTER_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <Footer />;
}
