import { z } from "zod"
import {
  CATEGORY_SLUGS,
  LISTING_CONDITIONS,
  LISTING_SORTS,
  LISTING_STATUSES,
  MAX_LISTING_IMAGES,
} from "./constants"

// Single source of truth: the forms validate with these via zodResolver and the
// tRPC procedures validate with the same objects, so the two cannot drift.

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id")

export const listingImageSchema = z.object({
  url: z.string().url(),
  thumbUrl: z.string().url().nullable().optional(),
  deleteUrl: z.string().url().nullable().optional(),
})

export const listingInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Give the item a title of at least 4 characters")
    .max(120, "Keep the title under 120 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Describe the item in at least 20 characters")
    .max(4000),
  price: z
    .number({ message: "Enter a price" })
    .int("Use whole numbers only")
    .min(0, "Price cannot be negative")
    .max(10_000_000),
  condition: z.enum(LISTING_CONDITIONS),
  // Validated against the hardcoded list, so an unknown slug is rejected at
  // the edge and the router does not need to look anything up.
  categorySlug: z.enum(CATEGORY_SLUGS, { message: "Pick a category" }),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  images: z
    .array(listingImageSchema)
    .min(1, "Add at least one photo")
    .max(MAX_LISTING_IMAGES, `Up to ${MAX_LISTING_IMAGES} photos`),
})

export type ListingInput = z.infer<typeof listingInputSchema>

export const listingFilterSchema = z.object({
  q: z.string().trim().max(120).optional(),
  categorySlug: z.enum(CATEGORY_SLUGS).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  condition: z.enum(LISTING_CONDITIONS).optional(),
  // "ANY" drops the status filter entirely; omitting it defaults to AVAILABLE.
  status: z.enum([...LISTING_STATUSES, "ANY"]).optional(),
  sellerId: objectId.optional(),
  sort: z.enum(LISTING_SORTS).default("newest"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export const profileInputSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  campus: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
})

export type ProfileInput = z.infer<typeof profileInputSchema>

export const messageInputSchema = z.object({
  conversationId: objectId,
  body: z.string().trim().min(1, "Type a message").max(2000),
})

export const idSchema = z.object({ id: objectId })

export type ListingImageInput = z.infer<typeof listingImageSchema>
