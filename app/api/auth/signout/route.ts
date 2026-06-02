import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear NextAuth session cookies
  response.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("next-auth.csrf-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("next-auth.callback-url", "", { path: "/", maxAge: 0 });

  // Always clear mock cookie
  response.cookies.set("mock_user", "", { path: "/", maxAge: 0 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is configured, also sign out from Supabase
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.signOut();
  }

  return response;
}
