import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Fetch all applications (admin view)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin auth
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader?.includes("admin_session=")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get applications with user and job details
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id,
        cover_letter,
        method,
        status,
        sent_at,
        created_at,
        user_id,
        cv_id,
        jobs:job_id (
          id,
          title,
          company,
          location,
          apply_email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch applications error:", error);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });

  } catch (error) {
    console.error("Admin applications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
