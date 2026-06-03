import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Store reset token in user metadata or separate table
    // For demo, we'll just use Supabase's built-in reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get("origin")}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      // Don't reveal if email exists
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists, a reset link has been sent." 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password reset link sent to your email." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
