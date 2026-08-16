import type { ListingCondition, ListingStatus } from "./constants"

// Mongoose documents carry _id, __v and prototype methods that tRPC cannot send
// over the wire. These mappers produce plain DTOs instead. Do not reach for
// JSON.parse(JSON.stringify(doc)) - it silently turns Dates into strings.

export type CategoryDTO = {
  id: string
  name: string
  slug: string
  icon: string | null
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

export function toCategoryDTO(doc: Doc): CategoryDTO {
  return {
    id: id(doc),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon ?? null,
  }
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
    category: isPopulated(doc.category) ? toCategoryDTO(doc.category) : null,
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
