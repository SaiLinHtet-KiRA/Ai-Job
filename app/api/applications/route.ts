import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET - Fetch user's applications
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const supabase = getSupabaseAdmin();

    // Get applications with job details (join with jobs table)
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id,
        cover_letter,
        method,
        status,
        sent_at,
        created_at,
        job_id,
        jobs:job_id (
          title,
          company,
          location,
          apply_email
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch applications error:", error);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });

  } catch (error) {
    console.error("Applications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
