import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ banned: false });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const normalizedEmail = email.toLowerCase().trim();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("status")
      .eq("email", normalizedEmail)
      .maybeSingle();

    return NextResponse.json({
      banned: profile?.status === "banned",
      exists: !!profile,
    });
  } catch {
    return NextResponse.json({ banned: false });
  }
}
