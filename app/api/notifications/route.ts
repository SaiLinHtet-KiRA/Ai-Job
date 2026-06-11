import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * List user notifications
 * @description Returns the authenticated user's notifications ordered by most recent first. Supports ?limit=N and ?unread=true query params.
 * @tags ["Notifications"]
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const unreadOnly = searchParams.get("unread") === "true";

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact", head: false })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    const unreadCount = unreadOnly
      ? (count ?? 0)
      : (data ?? []).filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: data ?? [],
      unread_count: unreadOnly ? undefined : unreadCount,
      total: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Mark notifications as read
 * @description Mark a single notification as read (send { id }) or all unread notifications (send { mark_all: true }).
 * @tags ["Notifications"]
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { id, mark_all } = body;

    const supabase = getSupabaseAdmin();

    if (mark_all) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "id or mark_all is required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
