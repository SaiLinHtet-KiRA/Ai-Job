import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockSupabase = { from: mockFrom };

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(() => mockSupabase),
}));

import { logAuditAction } from "@/lib/audit";

describe("logAuditAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts an audit log record with all fields", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    await logAuditAction({
      adminEmail: "admin@test.com",
      action: "user_banned",
      details: "Banned user for spam",
      targetUserId: "user-123",
      targetJobId: 42,
    });

    expect(mockFrom).toHaveBeenCalledWith("audit_logs");
    expect(mockInsert).toHaveBeenCalledWith({
      admin_email: "admin@test.com",
      action: "user_banned",
      details: "Banned user for spam",
      target_user_id: "user-123",
      target_job_id: 42,
    });
  });

  it("inserts with null optional fields", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    await logAuditAction({
      adminEmail: "admin@test.com",
      action: "job_listing_created",
      details: "Created job",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      admin_email: "admin@test.com",
      action: "job_listing_created",
      details: "Created job",
      target_user_id: null,
      target_job_id: null,
    });
  });

  it("does not throw when insert fails with error", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "Table not found" } });

    await expect(
      logAuditAction({
        adminEmail: "admin@test.com",
        action: "test",
        details: "test",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw when supabase throws", async () => {
    mockFrom.mockImplementationOnce(() => {
      throw new Error("Connection error");
    });

    await expect(
      logAuditAction({
        adminEmail: "admin@test.com",
        action: "test",
        details: "test",
      })
    ).resolves.toBeUndefined();
  });
});
