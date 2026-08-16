import {
  type CategorySlug,
  findCategory,
  type ListingCondition,
  type ListingStatus,
} from "./constants"

// Mongoose documents carry _id, __v and prototype methods that tRPC cannot send
// over the wire. These mappers produce plain DTOs instead. Do not reach for
// JSON.parse(JSON.stringify(doc)) - it silently turns Dates into strings.

// Resolved from the hardcoded CATEGORIES list, not from a database row, so
// there is no id here - the slug is the identifier.
export type CategoryDTO = {
  name: string
  slug: CategorySlug
  icon: string
}

export type PublicUserDTO = {
  id: string
  name: string
  image: string | null
  campus: string | null
  bio: string | null
  createdAt: Date
}

export type MeDTO = PublicUserDTO & {
  email: string
  phone: string | null
}

export type ListingImageDTO = {
  url: string
  thumbUrl: string | null
}

export type ListingDTO = {
  id: string
  title: string
  description: string
  price: number
  condition: ListingCondition
  status: ListingStatus
  location: string | null
  images: ListingImageDTO[]
  category: CategoryDTO | null
  seller: PublicUserDTO | null
  createdAt: Date
  updatedAt: Date
}

export type MessageDTO = {
  id: string
  body: string
  senderId: string
  readAt: Date | null
  createdAt: Date
}

export type ConversationDTO = {
  id: string
  listing: Pick<
    ListingDTO,
    "id" | "title" | "price" | "status" | "images"
  > | null
  otherUser: PublicUserDTO | null
  lastMessage: string | null
  lastMessageAt: Date
  unreadCount: number
}

// biome-ignore lint/suspicious/noExplicitAny: lean() results are structurally typed at the call site
type Doc = any

const id = (value: Doc): string => String(value?._id ?? value)

const isPopulated = (value: Doc): boolean =>
  Boolean(value) && typeof value === "object" && "_id" in value

export function toCategoryDTO(
  slug: string | null | undefined,
): CategoryDTO | null {
  const category = findCategory(slug)
  if (!category) return null
  return { name: category.name, slug: category.slug, icon: category.icon }
}

export function toPublicUserDTO(doc: Doc): PublicUserDTO {
  return {
    id: id(doc),
    name: doc.name,
    image: doc.image ?? null,
    campus: doc.campus ?? null,
    bio: doc.bio ?? null,
    createdAt: doc.createdAt,
  }
}

export function toMeDTO(doc: Doc): MeDTO {
  return {
    ...toPublicUserDTO(doc),
    email: doc.email,
    phone: doc.phone ?? null,
  }
}

export function toListingDTO(doc: Doc): ListingDTO {
  return {
    id: id(doc),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    condition: doc.condition,
    status: doc.status,
    location: doc.location ?? null,
    images: (doc.images ?? []).map((image: Doc) => ({
      url: image.url,
      thumbUrl: image.thumbUrl ?? null,
    })),
    // doc.category is a slug string; an unknown one resolves to null rather
    // than throwing, so a legacy row cannot take a whole page down.
    category: toCategoryDTO(doc.category),
    seller: isPopulated(doc.seller) ? toPublicUserDTO(doc.seller) : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function toMessageDTO(doc: Doc): MessageDTO {
  return {
    id: id(doc),
    body: doc.body,
    senderId: id(doc.sender),
    readAt: doc.readAt ?? null,
    createdAt: doc.createdAt,
  }
}
