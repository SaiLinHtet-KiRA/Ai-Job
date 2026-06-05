import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (action === "ban") {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        ban_duration: "720h",
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("user_id", id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("user_profiles")
          .update({ status: "banned" })
          .eq("user_id", id);
      }

      return NextResponse.json({ success: true, banned: true });
    }

    if (action === "unban") {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        ban_duration: "none",
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase
        .from("user_profiles")
        .update({ status: "active" })
        .eq("user_id", id);

      return NextResponse.json({ success: true, banned: false });
    }

    return NextResponse.json({ error: "Invalid action. Use 'ban' or 'unban'" }, { status: 400 });
  } catch (err) {
    console.error("Admin user action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
