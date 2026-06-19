"use client";

import { SessionProvider as Provider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

function BfcacheGuard({ children }: { children: ReactNode }) {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return <>{children}</>;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <Provider refetchOnWindowFocus={true} refetchInterval={300}>
      <BfcacheGuard>{children}</BfcacheGuard>
    </Provider>
  );
}
