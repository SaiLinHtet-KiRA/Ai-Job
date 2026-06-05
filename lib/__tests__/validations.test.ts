import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  formatZodError,
  applySchema,
  loginSchema,
  titleSchema,
  adminCreateSchema,
  adminUpdateSchema,
  jobListingCreateSchema,
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

describe("applySchema", () => {
  const resumeFile = new File(["dummy"], "resume.pdf", { type: "application/pdf" });

  it("accepts valid application data", () => {
    const result = applySchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      position: "Software Engineer",
      type: "Full-time",
      salary: "$100k",
      resume: resumeFile,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = applySchema.safeParse({
      email: "john@example.com",
      position: "Software Engineer",
      type: "Full-time",
      salary: "$100k",
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
      salary: "$100k",
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
      salary: "$100k",
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
      salary: "$100k",
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
      salary: "$100k",
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
      salary: "$100k",
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

describe("jobListingCreateSchema", () => {
  it("accepts a minimal job listing with title and company", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Frontend Developer",
      company: "Acme Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Frontend Developer");
      expect(result.data.company).toBe("Acme Corp");
    }
  });

  it("accepts a full job listing", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Frontend Developer",
      company: "Acme Corp",
      location: "Remote",
      job_type: "full-time",
      salary_range: "$80k-$120k",
      skills: ["React", "TypeScript"],
      description: "A great role",
      apply_url: "https://example.com",
      apply_email: "jobs@acme.com",
      source: "manual",
      expires_in_days: 30,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = jobListingCreateSchema.safeParse({ company: "Acme" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });

  it("rejects missing company", () => {
    const result = jobListingCreateSchema.safeParse({ title: "Dev" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Company is required.");
    }
  });

  it("rejects empty title", () => {
    const result = jobListingCreateSchema.safeParse({ title: "", company: "Acme" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });

  it("applies default values", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Engineer",
      company: "Acme",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBe("");
      expect(result.data.job_type).toBe("full-time");
      expect(result.data.salary_range).toBe("");
      expect(result.data.skills).toEqual([]);
      expect(result.data.description).toBe("");
      expect(result.data.apply_url).toBe("");
      expect(result.data.apply_email).toBe("");
      expect(result.data.source).toBe("manual");
      expect(result.data.expires_in_days).toBe(30);
    }
  });

  it("rejects expires_in_days below 1", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Dev",
      company: "Acme",
      expires_in_days: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects expires_in_days above 365", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Dev",
      company: "Acme",
      expires_in_days: 400,
    });
    expect(result.success).toBe(false);
  });

  it("accepts expires_in_days of 1", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Dev",
      company: "Acme",
      expires_in_days: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts expires_in_days of 365", () => {
    const result = jobListingCreateSchema.safeParse({
      title: "Dev",
      company: "Acme",
      expires_in_days: 365,
    });
    expect(result.success).toBe(true);
  });
});
