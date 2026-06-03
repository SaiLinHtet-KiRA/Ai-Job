import { describe, it, expect } from "vitest";
import { getClientIp } from "@/lib/rate-limit";

describe("rate-limit", () => {
  describe("getClientIp", () => {
    it("returns the first IP from x-forwarded-for header", () => {
      const req = new Request("https://example.com/api/test", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 198.51.100.1, 192.0.2.1",
        },
      });
      expect(getClientIp(req)).toBe("203.0.113.1");
    });

    it("returns a single IP from x-forwarded-for header", () => {
      const req = new Request("https://example.com/api/test", {
        headers: {
          "x-forwarded-for": "203.0.113.42",
        },
      });
      expect(getClientIp(req)).toBe("203.0.113.42");
    });

    it("trims whitespace from the IP", () => {
      const req = new Request("https://example.com/api/test", {
        headers: {
          "x-forwarded-for": "  203.0.113.99  , 198.51.100.1",
        },
      });
      expect(getClientIp(req)).toBe("203.0.113.99");
    });

    it("returns 'unknown' when no x-forwarded-for header exists", () => {
      const req = new Request("https://example.com/api/test");
      expect(getClientIp(req)).toBe("unknown");
    });

    it("returns 'unknown' when x-forwarded-for header is empty", () => {
      const req = new Request("https://example.com/api/test", {
        headers: {
          "x-forwarded-for": "",
        },
      });
      expect(getClientIp(req)).toBe("unknown");
    });

    it("ignores other headers", () => {
      const req = new Request("https://example.com/api/test", {
        headers: {
          "x-real-ip": "10.0.0.1",
          host: "example.com",
        },
      });
      expect(getClientIp(req)).toBe("unknown");
    });
  });
});
