import { NextRequest, NextResponse } from "next/server";

// GET - Fetch admin audit log
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader?.includes("admin_session=")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For demo, return mock audit logs
    // In production, this would query an audit_logs table
    const mockAuditLogs = [
      {
        id: 1,
        admin_email: "admin@example.com",
        action: "user_banned",
        target_user_id: "usr-004",
        details: "Banned user for suspicious activity",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      },
      {
        id: 2,
        admin_email: "admin@example.com",
        action: "email_verified",
        target_user_id: "usr-003",
        details: "Manually verified user email",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: 3,
        admin_email: "admin@example.com",
        action: "password_reset_sent",
        target_user_id: "usr-002",
        details: "Sent password reset link",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      },
      {
        id: 4,
        admin_email: "admin@example.com",
        action: "job_listing_created",
        target_job_id: 15,
        details: "Created new job listing via admin panel",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

    return NextResponse.json({ audit_logs: mockAuditLogs });

  } catch (error) {
    console.error("Audit log API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
