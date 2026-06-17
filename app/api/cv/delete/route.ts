import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { updateUserSuitableTitle } from "@/lib/user-profile";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { data: cv, error: fetchError } = await supabase
      .from("user_cvs")
      .select("id, storage_path")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError || !cv) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }

    const { error: storageError } = await supabase.storage
      .from("cvs")
      .remove([cv.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    const { error: unlinkError } = await supabase
      .from("applications")
      .update({ cv_id: null })
      .eq("cv_id", cv.id);

    if (unlinkError) {
      console.error("Unlink applications error:", unlinkError);
    }

    updateUserSuitableTitle(userId, []).catch((err) => {
      console.error("Failed to clear suitable title:", err);
    });

    const { error: dbError } = await supabase
      .from("user_cvs")
      .delete()
      .eq("id", cv.id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CV delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
