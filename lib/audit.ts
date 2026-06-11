import { getSupabaseAdmin } from "@/lib/supabase";

interface AuditEntry {
  adminEmail: string;
  action: string;
  details: string;
  targetUserId?: string;
  targetJobId?: number;
}

export async function logAuditAction(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("audit_logs").insert({
      admin_email: entry.adminEmail,
      action: entry.action,
      details: entry.details,
      target_user_id: entry.targetUserId ?? null,
      target_job_id: entry.targetJobId ?? null,
    });
    if (error) {
      console.error("Failed to log audit action:", error.message);
    }
  } catch (err) {
    console.error("Failed to log audit action:", err);
  }
}
