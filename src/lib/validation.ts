import { z } from "zod";

// Common validations
const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase with hyphens only",
  );

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const registrationStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

// News schemas
export const createNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: slugSchema.optional(), // Auto-generated if not provided
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  image: z.string().optional(),
  status: statusSchema.optional().default("DRAFT"),
});

export const updateNewsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  image: z.string().optional(),
  status: statusSchema.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

// Event schemas
export const createEventSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    slug: slugSchema.optional(), // Auto-generated if not provided
    description: z.string().min(1, "Description is required"),
    location: z.string().min(1, "Location is required").max(200),
    image: z.string().optional(),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
    capacity: z.number().int().positive().optional().nullable(),
    status: statusSchema.optional().default("DRAFT"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateEventSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    slug: slugSchema.optional(),
    description: z.string().min(1).optional(),
    location: z.string().min(1).max(200).optional(),
    image: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    capacity: z.number().int().positive().optional().nullable(),
    status: statusSchema.optional(),
    publishedAt: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

// Blog schemas
export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: slugSchema.optional(), // Auto-generated if not provided
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  status: statusSchema.optional().default("DRAFT"),
});

export const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  image: z.string().optional(),
  status: statusSchema.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

// EventRegistration schemas
export const updateRegistrationSchema = z.object({
  status: registrationStatusSchema,
});

// AdminNote schemas
export const createAdminNoteSchema = z.object({
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string().cuid("Invalid entity ID"),
  content: z.string().min(1, "Content is required"),
});

export const updateAdminNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

// Utility: Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .substring(0, 200); // Limit length
}

// Utility: Validate and generate slug if needed
export function ensureSlug(data: { title: string; slug?: string }): string {
  if (data.slug) {
    slugSchema.parse(data.slug);
    return data.slug;
  }
  return generateSlug(data.title);
}
