// Kept here (not in firebase/admin.ts) so the edge middleware can import it
// without pulling in the node-only firebase-admin SDK.
export const SESSION_COOKIE = "session"
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

/*
 * Categories are fixed in code, not rows in a collection. There is no admin UI
 * and there is not going to be one, so a `categories` collection would only be
 * a table nobody can edit plus a join on every listing query. The slug is the
 * stored value on a listing and the value in the ?category= URL, so treat it
 * as a stable identifier: renaming one is a data migration, changing `name` or
 * `icon` is free.
 *
 * `icon` is a lucide-react export name, resolved in components/category-rail.tsx.
 */
export const CATEGORIES = [
  { slug: "textbooks", name: "Textbooks", icon: "BookOpen" },
  { slug: "calculators", name: "Calculators", icon: "Calculator" },
  { slug: "electronics", name: "Electronics", icon: "Laptop" },
  { slug: "lab-equipment", name: "Lab Equipment", icon: "FlaskConical" },
  { slug: "stationery", name: "Stationery", icon: "PencilRuler" },
  { slug: "notes-and-guides", name: "Notes & Guides", icon: "NotebookPen" },
  { slug: "other", name: "Other", icon: "Shapes" },
] as const

export type Category = (typeof CATEGORIES)[number]
export type CategorySlug = Category["slug"]

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug) as [
  CategorySlug,
  ...CategorySlug[],
]

const CATEGORY_BY_SLUG = new Map<string, Category>(
  CATEGORIES.map((category) => [category.slug, category]),
)

export function findCategory(slug: string | null | undefined) {
  return slug ? (CATEGORY_BY_SLUG.get(slug) ?? null) : null
}

export const LISTING_CONDITIONS = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
  "POOR",
] as const

export type ListingCondition = (typeof LISTING_CONDITIONS)[number]

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
}

export const LISTING_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const

export type ListingStatus = (typeof LISTING_STATUSES)[number]

export const STATUS_LABELS: Record<ListingStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
}

export const LISTING_SORTS = ["newest", "price_asc", "price_desc"] as const

export type ListingSort = (typeof LISTING_SORTS)[number]

export const SORT_LABELS: Record<ListingSort, string> = {
  newest: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
}

export const CURRENCY = "৳"

export function formatPrice(value: number) {
  return `${CURRENCY}${value.toLocaleString()}`
}

export const MAX_LISTING_IMAGES = 5
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]
