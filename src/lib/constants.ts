// Kept here (not in firebase/admin.ts) so the edge middleware can import it
// without pulling in the node-only firebase-admin SDK.
export const SESSION_COOKIE = "session"
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

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
