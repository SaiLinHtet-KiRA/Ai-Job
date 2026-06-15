import { z } from "zod";

export function formatZodError(result: { success: false; error: z.ZodError }): string {
  return result.error.issues[0]?.message ?? "Validation failed.";
}

export const applySchema = z.object({
  name: z.string({ message: "Name is required." }).min(1, "Name is required."),
  email: z
    .string({ message: "Email is required." })
    .min(1, "Email is required.")
    .email("Invalid email address."),
  position: z.string({ message: "Position is required." }).min(1, "Position is required."),
  type: z.string({ message: "Job type is required." }).min(1, "Job type is required."),
  salary: z.string({ message: "Salary is required." }).min(1, "Salary is required."),
  resume: z.instanceof(File, { message: "Resume file is required." }),
});

export const loginSchema = z.object({
  email: z.string({ message: "Email is required." }).min(1, "Email is required."),
  password: z.string({ message: "Password is required." }).min(1, "Password is required."),
});

export const titleSchema = z.object({
  name: z.string({ message: "Title name is required." }).min(1, "Title name is required."),
});

export const adminCreateSchema = z.object({
  email: z.string({ message: "Email is required." }).min(1, "Email is required."),
  password: z.string({ message: "Password is required." }).min(1, "Password is required."),
});

export const adminUpdateSchema = z
  .object({
    email: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
  })
  .refine((data) => data.email || data.password, {
    message: "Nothing to update.",
  });

export const cvScoresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const cvScoresIdSchema = z.object({
  id: z.coerce.number().int().min(1, "Invalid ID"),
});

export const jobListingCreateSchema = z.object({
  title: z.string({ message: "Title is required." }).min(1, "Title is required."),
  company: z.string({ message: "Company is required." }).min(1, "Company is required."),
  location: z.string().optional().default(""),
  job_type: z.string().optional().default("full-time"),
  salary_range: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(""),
  apply_url: z.string().optional().default(""),
  apply_email: z.string().optional().default(""),
  source: z.string().optional().default("manual"),
  expires_in_days: z.number().int().min(1).max(365).optional().default(30),
});

export const emailsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  type: z.string().optional(),
  status: z.string().optional(),
});

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  action: z.string().optional(),
});

export const applicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  status: z.string().optional(),
  email: z.string().optional(),
});

export const userActionSchema = z.object({
  action: z.enum(["ban", "unban"], { message: "Action must be 'ban' or 'unban'." }),
});

export const courseCreateSchema = z.object({
  title: z.string({ message: "Title is required." }).min(1, "Title is required."),
  url: z.string({ message: "URL is required." }).min(1, "URL is required."),
  platform: z.string().optional().default("other"),
  duration: z.string().optional(),
  level: z.string().optional().default("beginner"),
  description: z.string().optional(),
  instructor: z.string().optional(),
  roles: z
    .array(
      z.object({
        role: z.string().min(1),
        sort_order: z.number().int().optional(),
      }),
    )
    .optional(),
});

export const courseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  platform: z.string().optional(),
  duration: z.string().optional(),
  level: z.string().optional(),
  description: z.string().optional(),
  instructor: z.string().optional(),
  roles: z
    .array(
      z.object({
        role: z.string().min(1),
        sort_order: z.number().int().optional(),
      }),
    )
    .optional(),
});

export const bulkCourseSchema = z.object({
  title: z.string({ message: "Title is required." }).min(1),
  url: z.string({ message: "URL is required." }).min(1),
  platform: z.string().optional(),
  duration: z.string().optional(),
  level: z.string().optional(),
  description: z.string().optional(),
  instructor: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

export const bulkCoursesRequestSchema = z.object({
  courses: z
    .array(bulkCourseSchema)
    .min(1, "At least one course is required.")
    .max(500, "Maximum 500 courses per bulk import."),
});
