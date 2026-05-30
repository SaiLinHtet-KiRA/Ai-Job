import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  formatZodError,
  jobQuerySchema,
  applySchema,
  loginSchema,
  titleSchema,
  jobCreateSchema,
  jobUpdateSchema,
  adminCreateSchema,
  adminUpdateSchema,
} from "@/lib/validations";

describe("formatZodError", () => {
  it("returns the first error message from a failed parse", () => {
    const result = titleSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title name is required.");
    }
  });

  it("returns a fallback when issues array is empty", () => {
    const mock: { success: false; error: z.ZodError } = {
      success: false,
      error: new z.ZodError([]),
    };
    expect(formatZodError(mock)).toBe("Validation failed.");
  });
});

describe("jobQuerySchema", () => {
  it("accepts a valid title query", () => {
    const result = jobQuerySchema.safeParse({ title: "Engineer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Engineer");
    }
  });

  it("accepts undefined title", () => {
    const result = jobQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts empty title object", () => {
    const result = jobQuerySchema.safeParse({ title: undefined });
    expect(result.success).toBe(true);
  });
});

describe("applySchema", () => {
  const resumeFile = new File(["dummy"], "resume.pdf", { type: "application/pdf" });

  it("accepts valid application data", () => {
    const result = applySchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      position: "Software Engineer",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = applySchema.safeParse({
      email: "john@example.com",
      position: "Software Engineer",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Name is required.");
    }
  });

  it("rejects invalid email", () => {
    const result = applySchema.safeParse({
      name: "John",
      email: "not-an-email",
      position: "Software Engineer",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Invalid email address.");
    }
  });

  it("rejects missing email", () => {
    const result = applySchema.safeParse({
      name: "John",
      position: "Software Engineer",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Email is required.");
    }
  });

  it("rejects missing position", () => {
    const result = applySchema.safeParse({
      name: "John",
      email: "john@example.com",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Position is required.");
    }
  });

  it("rejects empty string fields", () => {
    const result = applySchema.safeParse({
      name: "",
      email: "john@example.com",
      position: "Engineer",
      type: "Full-time",
      salary: 100000,
      resume: resumeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Name is required.");
    }
  });

  it("rejects missing resume file", () => {
    const result = applySchema.safeParse({
      name: "John",
      email: "john@example.com",
      position: "Engineer",
      type: "Full-time",
      salary: 100000,
      resume: "not-a-file",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Resume file is required.");
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "secure123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "secure123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Email is required.");
    }
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "admin@example.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Password is required.");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secure123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Email is required.");
    }
  });
});

describe("titleSchema", () => {
  it("accepts a valid title name", () => {
    const result = titleSchema.safeParse({ name: "Software Engineer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Software Engineer");
    }
  });

  it("rejects empty name", () => {
    const result = titleSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title name is required.");
    }
  });

  it("rejects missing name", () => {
    const result = titleSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title name is required.");
    }
  });
});

describe("jobCreateSchema", () => {
  it("accepts a job with only title", () => {
    const result = jobCreateSchema.safeParse({ title: "Software Engineer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Software Engineer");
      expect(result.data.type).toBe("On-site");
    }
  });

  it("accepts a job with all fields", () => {
    const result = jobCreateSchema.safeParse({
      title: "Software Engineer",
      company: "Acme Corp",
      email: "hr@acme.com",
      location: "New York",
      type: "Remote",
      salary: 120000,
      description: "A great job",
      image_url: "https://example.com/img.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = jobCreateSchema.safeParse({ company: "Acme" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });

  it("rejects empty title", () => {
    const result = jobCreateSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });

  it("applies default values for omitted optional fields", () => {
    const result = jobCreateSchema.safeParse({ title: "Engineer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("");
      expect(result.data.email).toBe("");
      expect(result.data.location).toBe("");
      expect(result.data.type).toBe("On-site");
      expect(result.data.salary).toBe(0);
      expect(result.data.description).toBe("");
      expect(result.data.image_url).toBe("");
      expect(result.data.company_website).toBe("");
    }
  });
});

describe("jobUpdateSchema", () => {
  it("accepts updating a single field", () => {
    const result = jobUpdateSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Updated Title");
    }
  });

  it("accepts updating multiple fields", () => {
    const result = jobUpdateSchema.safeParse({
      title: "Updated Title",
      company: "New Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = jobUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Nothing to update.");
    }
  });

  it("rejects empty title string", () => {
    const result = jobUpdateSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Too small");
    }
  });
});

describe("adminCreateSchema", () => {
  it("accepts valid admin data", () => {
    const result = adminCreateSchema.safeParse({
      email: "newadmin@example.com",
      password: "secure123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = adminCreateSchema.safeParse({ password: "secure123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Email is required.");
    }
  });

  it("rejects missing password", () => {
    const result = adminCreateSchema.safeParse({ email: "admin@example.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Password is required.");
    }
  });

  it("rejects empty email", () => {
    const result = adminCreateSchema.safeParse({
      email: "",
      password: "secure123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Email is required.");
    }
  });
});

describe("adminUpdateSchema", () => {
  it("accepts email only update", () => {
    const result = adminUpdateSchema.safeParse({ email: "updated@example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts password only update", () => {
    const result = adminUpdateSchema.safeParse({ password: "newpass123" });
    expect(result.success).toBe(true);
  });

  it("accepts both fields", () => {
    const result = adminUpdateSchema.safeParse({
      email: "updated@example.com",
      password: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = adminUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Nothing to update.");
    }
  });

  it("rejects empty email", () => {
    const result = adminUpdateSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Too small");
    }
  });
});
