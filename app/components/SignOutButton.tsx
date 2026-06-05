"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg border border-white/10 px-4 py-2 text-[13px] font-medium text-[#8898aa] transition-colors hover:border-white/20 hover:text-white"
    >
      Sign out
    </button>
  );
}
