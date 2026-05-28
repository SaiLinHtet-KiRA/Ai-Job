import { test, expect } from "@playwright/test";

test.describe("API Routes", () => {
  test("GET /api/titles returns array of titles", async ({ request }) => {
    const res = await request.get("/api/titles");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/jobs returns array of jobs", async ({ request }) => {
    const res = await request.get("/api/jobs");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/jobs?title=X filters results", async ({ request }) => {
    const res = await request.get("/api/jobs?title=Software");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // Every returned job should contain "Software" in title (case-insensitive)
    for (const job of data) {
      expect(job.title.toLowerCase()).toContain("software");
    }
  });

  test("POST /api/apply without fields returns 400", async ({ request }) => {
    const formData = new FormData();
    formData.append("name", "");

    const res = await request.post("/api/apply", {
      multipart: formData,
    });
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("GET /api/admin/login without credentials returns 405", async ({
    request,
  }) => {
    // GET should return method not allowed (POST only)
    const res = await request.get("/api/admin/login");
    expect(res.status()).toBe(405);
  });
});
