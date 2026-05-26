import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated, getCurrentAdminId } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { email, password } = body;

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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 },
      );
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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
