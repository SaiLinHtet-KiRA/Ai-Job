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

  test("POST /api/admin/login with invalid body returns error", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/login", {
      data: { email: "" },
    });
    expect([400, 500]).toContain(res.status());

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/admin/login with bad credentials returns error", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/login", {
      data: { email: "nonexistent@test.com", password: "wrong" },
    });
    expect([401, 500]).toContain(res.status());

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/leads without email returns error", async ({ request }) => {
    const res = await request.post("/api/leads", {
      data: {},
    });
    expect([400, 429, 500]).toContain(res.status());

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/leads with invalid email returns error", async ({
    request,
  }) => {
    const res = await request.post("/api/leads", {
      data: { email: "not-an-email" },
    });
    expect([400, 429, 500]).toContain(res.status());

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/match without cv_text returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/match", {
      data: { cv_text: "" },
    });
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/match with short cv_text returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/match", {
      data: { cv_text: "short" },
    });
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/match with valid cv_text returns job matches", async ({
    request,
  }) => {
    const cvText = `Experienced frontend developer with 5 years of React, TypeScript, and Next.js experience.
      Proficient in Tailwind CSS, Redux, and Git. Built scalable web applications.
      Strong background in UI development and responsive design patterns.`;

    const res = await request.post("/api/match", {
      data: { cv_text: cvText },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.role).toBeDefined();
    expect(typeof data.total_matches).toBe("number");
    expect(Array.isArray(data.jobs)).toBe(true);
    if (data.jobs.length > 0) {
      const job = data.jobs[0];
      expect(job.id).toBeDefined();
      expect(job.title).toBeDefined();
      expect(job.company).toBeDefined();
      expect(typeof job.match_score).toBe("number");
      expect(Array.isArray(job.required_skills)).toBe(true);
    }
  });

  test("POST /api/tailor without job_title returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/tailor", {
      data: { company: "TestCorp" },
    });
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/tailor without company returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/tailor", {
      data: { job_title: "Developer" },
    });
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("POST /api/tailor with required fields returns tailored content", async ({
    request,
  }) => {
    const res = await request.post("/api/tailor", {
      data: {
        job_title: "Frontend Developer",
        company: "TestCorp",
        required_skills: ["React", "TypeScript"],
        user_skills: ["React", "CSS"],
      },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.tailored_summary).toBeDefined();
    expect(data.cover_letter).toBeDefined();
    expect(Array.isArray(data.talking_points)).toBe(true);
    expect(Array.isArray(data.matched_skills)).toBe(true);
  });

  test("POST /api/courses returns 400 without role param", async ({
    request,
  }) => {
    const res = await request.get("/api/courses");
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("GET /api/courses?role=X returns paginated response", async ({ request }) => {
    const res = await request.get("/api/courses?role=frontend+developer");
    // May return 200 or 500 depending on Supabase setup, but not 400
    expect(res.status()).not.toBe(400);
    if (res.status() === 200) {
      const data = await res.json();
      expect(data.role).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(typeof data.total).toBe("number");
      expect(typeof data.page).toBe("number");
      expect(typeof data.limit).toBe("number");
      expect(typeof data.totalPages).toBe("number");
    }
  });

  test("GET /api/admin/titles returns 401 without auth", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/titles");
    expect(res.status()).toBe(401);
  });

  test("GET /api/digest/preview with user_id returns digest", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/digest/preview?user_id=test-user-1",
    );
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.subject).toBeDefined();
    expect(data.html).toBeDefined();
  });

  test("GET /api/digest/preview without user_id returns 400", async ({
    request,
  }) => {
    const res = await request.get("/api/digest/preview");
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
