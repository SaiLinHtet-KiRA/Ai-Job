import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSession, verifySession } from "@/lib/auth";

describe("auth", () => {
  describe("hashPassword / verifyPassword", () => {
    it("hashes a password in salt:hash format", () => {
      const result = hashPassword("mypassword");
      const parts = result.split(":");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32);
      expect(parts[1]).toHaveLength(128);
    });

    it("verifies a correct password", () => {
      const stored = hashPassword("secure123");
      expect(verifyPassword("secure123", stored)).toBe(true);
    });

    it("rejects an incorrect password", () => {
      const stored = hashPassword("secure123");
      expect(verifyPassword("wrong", stored)).toBe(false);
    });

    it("rejects malformed stored value", () => {
      expect(verifyPassword("anything", "badformat")).toBe(false);
    });

    it("produces different hashes for the same password", () => {
      const a = hashPassword("same");
      const b = hashPassword("same");
      expect(a).not.toBe(b);
    });
  });

  describe("createSession / verifySession", () => {
    it("creates a valid session token", async () => {
      const token = await createSession("admin@test.com");
      const parts = token.split(":");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("admin@test.com");
    });

    it("verifies a valid session token", async () => {
      const email = await verifySession(await createSession("admin@test.com"));
      expect(email).toBe("admin@test.com");
    });

    it("returns null for a tampered token", async () => {
      const token = await createSession("admin@test.com");
      const parts = token.split(":");
      parts[2] = "tampered_signature";
      const email = await verifySession(parts.join(":"));
      expect(email).toBeNull();
    });

    it("returns null for malformed token", async () => {
      const email = await verifySession("not-enough-parts");
      expect(email).toBeNull();
    });
  });
});
