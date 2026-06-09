import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyCode,
  deleteCode,
  getPendingUser,
  deletePendingUser,
} from "@/lib/verification-code";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const isValid = await verifyCode(normalizedEmail, code.trim());
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const pending = await getPendingUser(normalizedEmail);
    if (!pending) {
      return NextResponse.json({ error: "Signup session expired. Please sign up again." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: pending.password,
      email_confirm: true,
      user_metadata: { name: pending.name ?? null },
    });

    if (error) {
      const msg = error.message.includes("already been registered")
        ? "An account with this email already exists"
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await deleteCode(normalizedEmail);
    await deletePendingUser(normalizedEmail);

    if (data.user) {
      await supabase.from("user_profiles").insert({
        user_id: data.user.id,
        email: normalizedEmail,
        status: "active",
        suitable_title: [],
        target_roles: [],
        preferred_locations: [],
        experience_level: "mid",
        remote_ok: true,
      });
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (err) {
    console.error("Verify code error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
