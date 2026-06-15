import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface BulkCourse {
  title: string;
  url: string;
  platform?: string;
  duration?: string;
  level?: string;
  description?: string;
  instructor?: string;
  roles?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses } = body as { courses: BulkCourse[] };

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { error: "courses array is required" },
        { status: 400 },
      );
    }

    if (courses.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 courses per bulk import" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const coursesToInsert = courses.map((c) => ({
      title: c.title?.trim(),
      url: c.url?.trim(),
      platform: c.platform?.trim() || "other",
      duration: c.duration?.trim() || null,
      level: c.level?.trim() || "beginner",
      description: c.description?.trim() || null,
      instructor: c.instructor?.trim() || "",
    }));

    // Validate required fields
    const invalid = coursesToInsert.find((c) => !c.title || !c.url);
    if (invalid) {
      return NextResponse.json(
        { error: "Each course must have title and url" },
        { status: 400 },
      );
    }

    const { data: inserted, error } = await supabase
      .from("courses")
      .insert(coursesToInsert)
      .select();

    if (error) {
      console.error("Bulk insert error:", error);
      return NextResponse.json(
        { error: "Failed to insert courses" },
        { status: 500 },
      );
    }

    // Collect all unique roles from the input
    const allRoles = new Set<string>();
    courses.forEach((c) => {
      (c.roles ?? []).forEach((r) => {
        if (r.trim()) allRoles.add(r.trim().toLowerCase());
      });
    });

    // Ensure all roles exist in the roles table
    if (allRoles.size > 0) {
      const rolesToInsert = Array.from(allRoles).map((name) => ({ name }));
      await supabase.from("roles").upsert(rolesToInsert, { onConflict: "name", ignoreDuplicates: true });
    }

    // Build role_courses links
    const roleLinks: { role: string; course_id: number; sort_order: number }[] = [];
    courses.forEach((c, i) => {
      const courseId = inserted?.[i]?.id;
      if (!courseId) return;
      (c.roles ?? []).forEach((role, j) => {
        if (role.trim()) {
          roleLinks.push({
            role: role.trim().toLowerCase(),
            course_id: courseId,
            sort_order: j,
          });
        }
      });
    });

    if (roleLinks.length > 0) {
      const { error: linkError } = await supabase.from("role_courses").insert(roleLinks);
      if (linkError) {
        console.error("Bulk role_courses insert error:", linkError);
      }
    }

    return NextResponse.json(
      { imported: inserted.length },
      { status: 201 },
    );
  } catch (err) {
    console.error("Bulk import error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
