import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { encode } from "next-auth/jwt";
import { getUserProfile, ensureUserProfile } from "@/lib/user-profile";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {
            // will be set on the response below
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const name = data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? null;

      const existingProfile = await getUserProfile(data.user.id);
      const isNewUser = !existingProfile;

      await ensureUserProfile(data.user.id, data.user.email!, name);

      if (isNewUser) {
        sendWelcomeEmail(data.user.email!, name ?? undefined).catch((err) =>
          console.error("sendWelcomeEmail failed (Google OAuth):", err)
        );
      }

      const response = NextResponse.redirect(`${origin}${next}`);

      const nextAuthToken = await encode({
        token: {
          id: data.user.id,
          email: data.user.email,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 30 * 24 * 60 * 60,
      });

      const cookieName =
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token";

      response.cookies.set(cookieName, nextAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
