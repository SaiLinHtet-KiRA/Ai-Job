import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie, hashPassword, verifyPassword } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema, formatZodError } from "@/lib/validations";

/**
 * Admin login
 * @description Authenticates with email and password. Creates a signed session cookie on success. If no admins exist yet, bootstraps the first admin from environment variables.
 * @tags ["Admin Auth"]
 */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(`login:${getClientIp(req)}`, { limit: 5, duration: 60 });
    if (limited) return limited;
    const parsed = loginSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const supabase = getSupabaseAdmin();

    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (admin) {
      if (!verifyPassword(password, admin.password_hash)) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 },
        );
      }
    } else {
      const { count } = await supabase
        .from("admins")
        .select("*", { count: "exact", head: true });

      if (count === 0) {
        const bootstrapEmail = process.env.ADMIN_EMAIL;
        const bootstrapPassword = process.env.ADMIN_PASSWORD;

        if (
          !bootstrapEmail ||
          !bootstrapPassword ||
          email !== bootstrapEmail ||
          password !== bootstrapPassword
        ) {
          return NextResponse.json(
            { error: "Invalid email or password." },
            { status: 401 },
          );
        }

        const passwordHash = hashPassword(bootstrapPassword);
        await supabase.from("admins").insert({
          email: bootstrapEmail,
          password_hash: passwordHash,
        });
      } else {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 },
        );
      }
    }

    const token = await createSession(email);
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
