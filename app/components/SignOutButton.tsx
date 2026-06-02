"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
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
