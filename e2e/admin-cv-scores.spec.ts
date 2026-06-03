import { test, expect } from "@playwright/test";

test.describe("Admin CV Scores API", () => {
  test("GET /api/admin/cv-scores returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/admin/cv-scores");
    expect(res.status()).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  test("GET /api/admin/cv-scores?page=1&pageSize=10 returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/admin/cv-scores?page=1&pageSize=10");
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/cv-scores/:id returns 401 without auth", async ({ request }) => {
    const res = await request.get("/api/admin/cv-scores/1");
    expect(res.status()).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  test("GET /api/admin/cv-scores/:id with non-numeric id returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/cv-scores/abc");
    expect(res.status()).toBe(401);
  });
});
