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
  cvScoresQuerySchema,
  cvScoresIdSchema,
  emailsQuerySchema,
  auditQuerySchema,
  usersQuerySchema,
  userActionSchema,
  courseCreateSchema,
  courseUpdateSchema,
  bulkCourseSchema,
  bulkCoursesRequestSchema,
  profileUpdateSchema,
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

describe("cvScoresQuerySchema", () => {
  it("accepts empty params (defaults)", () => {
    const result = cvScoresQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(10);
  });

  it("coerces string params to numbers", () => {
    const result = cvScoresQuerySchema.safeParse({ page: "3", pageSize: "25" });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(3);
    expect(result.data?.pageSize).toBe(25);
  });

  it("rejects pageSize over 50", () => {
    const result = cvScoresQuerySchema.safeParse({ pageSize: "100" });
    expect(result.success).toBe(false);
  });
});

describe("cvScoresIdSchema", () => {
  it("accepts valid positive integer id", () => {
    const result = cvScoresIdSchema.safeParse({ id: "5" });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(5);
  });

  it("rejects zero", () => {
    const result = cvScoresIdSchema.safeParse({ id: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative", () => {
    const result = cvScoresIdSchema.safeParse({ id: "-1" });
    expect(result.success).toBe(false);
  });
});

describe("emailsQuerySchema", () => {
  it("accepts empty params", () => {
    const result = emailsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(10);
  });

  it("accepts optional type and status filters", () => {
    const result = emailsQuerySchema.safeParse({ type: "welcome", status: "sent" });
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("welcome");
    expect(result.data?.status).toBe("sent");
  });

  it("accepts page and pageSize", () => {
    const result = emailsQuerySchema.safeParse({ page: "2", pageSize: "20" });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(2);
    expect(result.data?.pageSize).toBe(20);
  });
});

describe("auditQuerySchema", () => {
  it("accepts empty params", () => {
    const result = auditQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(10);
  });

  it("accepts optional action filter", () => {
    const result = auditQuerySchema.safeParse({ action: "user_banned" });
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("user_banned");
  });

  it("accepts pagination params", () => {
    const result = auditQuerySchema.safeParse({ page: "3", pageSize: "5" });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(3);
    expect(result.data?.pageSize).toBe(5);
  });
});

describe("usersQuerySchema", () => {
  it("accepts empty params", () => {
    const result = usersQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.pageSize).toBe(10);
  });

  it("accepts status and email filters", () => {
    const result = usersQuerySchema.safeParse({
      status: "banned",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe("banned");
    expect(result.data?.email).toBe("test@example.com");
  });

  it("accepts pagination", () => {
    const result = usersQuerySchema.safeParse({ page: "2", pageSize: "30" });
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(2);
    expect(result.data?.pageSize).toBe(30);
  });

  it("rejects pageSize over 50", () => {
    const result = usersQuerySchema.safeParse({ pageSize: "51" });
    expect(result.success).toBe(false);
  });
});

describe("userActionSchema", () => {
  it("accepts ban action", () => {
    const result = userActionSchema.safeParse({ action: "ban" });
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("ban");
  });

  it("accepts unban action", () => {
    const result = userActionSchema.safeParse({ action: "unban" });
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("unban");
  });

  it("rejects invalid action", () => {
    const result = userActionSchema.safeParse({ action: "delete" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("ban");
    }
  });

  it("rejects empty action", () => {
    const result = userActionSchema.safeParse({ action: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing action", () => {
    const result = userActionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("courseCreateSchema", () => {
  it("accepts minimal course with title and url", () => {
    const result = courseCreateSchema.safeParse({
      title: "React Fundamentals",
      url: "https://example.com/react",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.platform).toBe("other");
      expect(result.data.level).toBe("beginner");
    }
  });

  it("accepts full course with roles", () => {
    const result = courseCreateSchema.safeParse({
      title: "Advanced React",
      url: "https://example.com/advanced-react",
      platform: "udemy",
      duration: "10 hours",
      level: "advanced",
      description: "Deep dive into React",
      instructor: "Jane Doe",
      roles: [{ role: "frontend", sort_order: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = courseCreateSchema.safeParse({ url: "https://example.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });

  it("rejects missing url", () => {
    const result = courseCreateSchema.safeParse({ title: "Some Course" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("URL is required.");
    }
  });

  it("rejects empty title", () => {
    const result = courseCreateSchema.safeParse({ title: "", url: "https://x.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toBe("Title is required.");
    }
  });
});

describe("courseUpdateSchema", () => {
  it("accepts partial update (title only)", () => {
    const result = courseUpdateSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = courseUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts roles update", () => {
    const result = courseUpdateSchema.safeParse({
      roles: [
        { role: "backend", sort_order: 0 },
        { role: "fullstack", sort_order: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts full update", () => {
    const result = courseUpdateSchema.safeParse({
      title: "New Title",
      url: "https://newurl.com",
      platform: "coursera",
      duration: "20 hours",
      level: "intermediate",
      description: "Updated description",
      instructor: "New Instructor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = courseUpdateSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty url", () => {
    const result = courseUpdateSchema.safeParse({ url: "" });
    expect(result.success).toBe(false);
  });
});

describe("bulkCourseSchema", () => {
  it("accepts a single valid course", () => {
    const result = bulkCourseSchema.safeParse({
      title: "Python Basics",
      url: "https://example.com/python",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a course with all fields", () => {
    const result = bulkCourseSchema.safeParse({
      title: "ML with Python",
      url: "https://example.com/ml",
      platform: "coursera",
      duration: "4 weeks",
      level: "intermediate",
      description: "Learn ML",
      instructor: "Prof. Smith",
      roles: ["data science", "python"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = bulkCourseSchema.safeParse({ url: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects missing url", () => {
    const result = bulkCourseSchema.safeParse({ title: "Some Course" });
    expect(result.success).toBe(false);
  });
});

describe("bulkCoursesRequestSchema", () => {
  it("accepts a single course in array", () => {
    const result = bulkCoursesRequestSchema.safeParse({
      courses: [{ title: "React", url: "https://react.dev" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple courses", () => {
    const result = bulkCoursesRequestSchema.safeParse({
      courses: [
        { title: "React", url: "https://react.dev" },
        { title: "Node.js", url: "https://nodejs.org" },
        { title: "TypeScript", url: "https://typescriptlang.org" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty courses array", () => {
    const result = bulkCoursesRequestSchema.safeParse({ courses: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("At least one course");
    }
  });

  it("rejects missing courses", () => {
    const result = bulkCoursesRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts courses with roles", () => {
    const result = bulkCoursesRequestSchema.safeParse({
      courses: [
        {
          title: "Advanced CSS",
          url: "https://example.com/css",
          platform: "udemy",
          duration: "8 hours",
          level: "advanced",
          roles: ["frontend", "design"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("profileUpdateSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts basic string fields", () => {
    const result = profileUpdateSchema.safeParse({
      full_name: "John Doe",
      headline: "Senior Engineer at Acme",
      location: "San Francisco, CA",
      about: "Experienced engineer...",
      website: "https://johndoe.com",
      linkedin_url: "https://linkedin.com/in/johndoe",
      phone: "+1 555 123 4567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.full_name).toBe("John Doe");
      expect(result.data.headline).toBe("Senior Engineer at Acme");
      expect(result.data.phone).toBe("+1 555 123 4567");
    }
  });

  it("accepts null for optional string fields", () => {
    const result = profileUpdateSchema.safeParse({
      full_name: null,
      headline: null,
      about: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts skills array", () => {
    const result = profileUpdateSchema.safeParse({
      skills: ["React", "TypeScript", "Node.js"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(["React", "TypeScript", "Node.js"]);
    }
  });

  it("accepts work experience array", () => {
    const result = profileUpdateSchema.safeParse({
      work_experience: [
        {
          title: "Senior Engineer",
          company: "Acme Corp",
          location: "Remote",
          start_date: "Jan 2022",
          end_date: "",
          current: true,
          description: "Led engineering team...",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.work_experience).toHaveLength(1);
      expect(result.data.work_experience![0].title).toBe("Senior Engineer");
      expect(result.data.work_experience![0].current).toBe(true);
    }
  });

  it("rejects work experience with missing title", () => {
    const result = profileUpdateSchema.safeParse({
      work_experience: [{ title: "", company: "Acme", start_date: "2022" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Job title");
    }
  });

  it("rejects work experience with missing company", () => {
    const result = profileUpdateSchema.safeParse({
      work_experience: [{ title: "Engineer", company: "", start_date: "2022" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Company");
    }
  });

  it("accepts education array", () => {
    const result = profileUpdateSchema.safeParse({
      education: [
        {
          school: "MIT",
          degree: "Bachelor's",
          field: "Computer Science",
          start_year: "2016",
          end_year: "2020",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.education![0].school).toBe("MIT");
    }
  });

  it("rejects education with missing school", () => {
    const result = profileUpdateSchema.safeParse({
      education: [{ school: "", degree: "BS", start_year: "2016" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("School");
    }
  });

  it("rejects education with missing degree", () => {
    const result = profileUpdateSchema.safeParse({
      education: [{ school: "MIT", degree: "", start_year: "2016" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Degree");
    }
  });

  it("accepts certifications array", () => {
    const result = profileUpdateSchema.safeParse({
      certifications: [
        {
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          date: "Jun 2024",
          url: "https://credential.example.com",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certifications![0].name).toBe("AWS Solutions Architect");
    }
  });

  it("rejects certification with missing name", () => {
    const result = profileUpdateSchema.safeParse({
      certifications: [{ name: "", issuer: "AWS" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Name");
    }
  });

  it("accepts languages array with valid proficiency", () => {
    const result = profileUpdateSchema.safeParse({
      languages: [
        { name: "English", proficiency: "native" },
        { name: "Spanish", proficiency: "professional" },
        { name: "French", proficiency: "elementary" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.languages).toHaveLength(3);
    }
  });

  it("rejects language with invalid proficiency", () => {
    const result = profileUpdateSchema.safeParse({
      languages: [{ name: "English", proficiency: "fluent" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects language with missing name", () => {
    const result = profileUpdateSchema.safeParse({
      languages: [{ name: "", proficiency: "native" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result)).toContain("Language name");
    }
  });

  it("accepts career preferences", () => {
    const result = profileUpdateSchema.safeParse({
      experience_level: "senior",
      target_roles: ["Staff Engineer", "Engineering Manager"],
      preferred_locations: ["San Francisco", "Remote"],
      remote_ok: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remote_ok).toBe(false);
      expect(result.data.target_roles).toHaveLength(2);
    }
  });

  it("accepts full profile update with all sections", () => {
    const result = profileUpdateSchema.safeParse({
      full_name: "Jane Doe",
      headline: "Full Stack Developer",
      location: "New York, NY",
      about: "Passionate developer with 5 years of experience.",
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
      languages: [{ name: "English", proficiency: "native" }],
      website: "https://janedoe.dev",
      linkedin_url: "https://linkedin.com/in/janedoe",
      phone: "+1 555 000 1234",
      work_experience: [
        {
          title: "Senior Developer",
          company: "Tech Co",
          location: "New York",
          start_date: "Mar 2023",
          current: true,
          description: "Building awesome products.",
        },
      ],
      education: [
        {
          school: "NYU",
          degree: "Master's",
          field: "Computer Science",
          start_year: "2019",
          end_year: "2021",
        },
      ],
      certifications: [
        {
          name: "AWS Developer Associate",
          issuer: "Amazon",
          date: "2022",
        },
      ],
      experience_level: "senior",
      target_roles: ["Senior Developer", "Tech Lead"],
      preferred_locations: ["New York", "Remote"],
      remote_ok: true,
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for work experience fields", () => {
    const result = profileUpdateSchema.safeParse({
      work_experience: [
        { title: "Dev", company: "Inc", start_date: "2020" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.work_experience![0].location).toBe("");
      expect(result.data.work_experience![0].current).toBe(false);
      expect(result.data.work_experience![0].description).toBe("");
      expect(result.data.work_experience![0].end_date).toBe("");
    }
  });

  it("applies defaults for education fields", () => {
    const result = profileUpdateSchema.safeParse({
      education: [{ school: "MIT", degree: "BS", start_year: "2018" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.education![0].field).toBe("");
      expect(result.data.education![0].end_year).toBe("");
    }
  });

  it("applies defaults for certification fields", () => {
    const result = profileUpdateSchema.safeParse({
      certifications: [{ name: "Cert", issuer: "Org" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certifications![0].date).toBe("");
      expect(result.data.certifications![0].url).toBe("");
    }
  });
});
