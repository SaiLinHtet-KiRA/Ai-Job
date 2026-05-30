import { z } from "zod";

export function formatZodError(result: { success: false; error: z.ZodError }): string {
  return result.error.issues[0]?.message ?? "Validation failed.";
}

export const jobQuerySchema = z.object({
  title: z.string().optional(),
});

export const applySchema = z.object({
  name: z.string({ message: "Name is required." }).min(1, "Name is required."),
  email: z
    .string({ message: "Email is required." })
    .min(1, "Email is required.")
    .email("Invalid email address."),
  position: z.string({ message: "Position is required." }).min(1, "Position is required."),
  type: z.string({ message: "Job type is required." }).min(1, "Job type is required."),
  salary: z.coerce.number({ message: "Salary is required." }).positive("Salary is required."),
  resume: z.instanceof(File, { message: "Resume file is required." }),
});

export const loginSchema = z.object({
  email: z.string({ message: "Email is required." }).min(1, "Email is required."),
  password: z.string({ message: "Password is required." }).min(1, "Password is required."),
});

export const titleSchema = z.object({
  name: z.string({ message: "Title name is required." }).min(1, "Title name is required."),
});

export const jobCreateSchema = z.object({
  title: z.string({ message: "Title is required." }).min(1, "Title is required."),
  company: z.string().optional().default(""),
  email: z.string().optional().default(""),
  location: z.string().optional().default(""),
  type: z.string().optional().default("On-site"),
  salary: z.coerce.number().optional().default(0),
  description: z.string().optional().default(""),
  image_url: z.string().optional().default(""),
  company_website: z.string().optional().default(""),
});

export const jobUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    type: z.string().optional(),
    salary: z.coerce.number().optional(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    company_website: z.string().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Nothing to update." },
  );

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
