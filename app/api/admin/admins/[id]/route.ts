import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated, getCurrentAdminId } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { adminUpdateSchema, formatZodError } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await rateLimit(`admin-admins:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = adminUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const supabase = getSupabaseAdmin();
    const updates: Record<string, string> = {};

    if (email) {
      const { data: existing } = await supabase
        .from("admins")
        .select("id")
        .eq("email", email)
        .neq("id", id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "An admin with this email already exists." },
          { status: 409 },
        );
      }
      updates.email = email;
    }

    if (password) {
      updates.password_hash = hashPassword(password);
    }

    const { data, error } = await supabase
      .from("admins")
      .update(updates)
      .eq("id", id)
      .select("id, email, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await rateLimit(`admin-admins:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const currentId = await getCurrentAdminId();

    if (currentId && currentId === Number(id)) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 403 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("admins").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
