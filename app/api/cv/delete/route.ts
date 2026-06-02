import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get user's CV
    const { data: cv, error: fetchError } = await supabase
      .from("user_cvs")
      .select("storage_path")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError || !cv) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("cvs")
      .remove([cv.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("user_cvs")
      .delete()
      .eq("user_id", userId);

    if (dbError) {
      return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CV delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
