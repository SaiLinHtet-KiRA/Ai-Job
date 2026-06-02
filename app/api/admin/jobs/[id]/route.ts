import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { jobUpdateSchema, formatZodError } from "@/lib/validations";

/**
 * Update a job posting
 * @description All fields are optional; only provided fields will be updated.
 * @tags ["Admin - Jobs"]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await rateLimit(`admin-jobs:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = jobUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed) },
        { status: 400 },
      );
    }

    const { title, company, email, location, type, salary, description, image_url } = parsed.data;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("jobs")
      .update({
        title,
        company: company || "",
        email: email || "",
        location: location || "",
        type: type || "On-site",
        salary: salary || "",
        description: description || "",
        image_url: image_url || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
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

/**
 * Delete a job posting
 * @tags ["Admin - Jobs"]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await rateLimit(`admin-jobs:${getClientIp(req)}`, { limit: 30, duration: 10 });
    if (limited) return limited;
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("jobs").delete().eq("id", id);

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
