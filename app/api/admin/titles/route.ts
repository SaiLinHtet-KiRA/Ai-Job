import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { titleSchema, formatZodError } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-titles:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .order("name", { ascending: true });

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

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(`admin-titles:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = titleSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { name } = parsed.data;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("titles")
      .insert({ name })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This title already exists." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
