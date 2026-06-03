import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth (existing) ──
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const session = request.cookies.get("admin_session");
    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (
    pathname.startsWith("/api/admin") &&
    pathname !== "/api/admin/login" &&
    pathname !== "/api/admin/logout"
  ) {
    const session = request.cookies.get("admin_session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── NextAuth/Auth0 session check ──
  // Temporarily disabled - Auth0 redirect loop issue
  // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // 
  // Protected routes - require authentication
  // const protectedPaths = ["/dashboard", "/jobs", "/roadmap", "/applications", "/profile"];
  // const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  // 
  // if (isProtected && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // ── Supabase Auth session refresh (legacy support) ──
  // Keep Supabase for admin operations that need it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh the session (this updates the cookie if needed)
    await supabase.auth.getUser();

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/roadmap/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
