import { TRPCError } from "@trpc/server"
import type { QueryFilter } from "mongoose"
import { z } from "zod"
import { LISTING_STATUSES } from "@/lib/constants"
import {
  idSchema,
  listingFilterSchema,
  listingInputSchema,
} from "@/lib/schemas"
import { toListingDTO } from "@/lib/serialize"
import {
  Category,
  Conversation,
  Favorite,
  Listing,
  type ListingDoc,
  Message,
} from "@/models"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

const POPULATE = [
  { path: "category", select: "name slug icon" },
  { path: "seller", select: "name image campus bio createdAt" },
]

/** User input goes straight into a $regex, so metacharacters must be neutralised. */
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
} as const

/** Loads a listing and refuses unless the caller owns it. */
async function requireOwnedListing(listingId: string, userId: unknown) {
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" })
  }
  if (String(listing.seller) !== String(userId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This listing is not yours",
    })
  }
  return listing
}

export const listingRouter = createTRPCRouter({
  list: publicProcedure.input(listingFilterSchema).query(async ({ input }) => {
    const where: QueryFilter<ListingDoc> = {}

    // Default to AVAILABLE so sold items do not clutter browsing.
    if (input.status !== "ANY") where.status = input.status ?? "AVAILABLE"

    if (input.q) {
      const pattern = new RegExp(escapeRegex(input.q), "i")
      where.$or = [{ title: pattern }, { description: pattern }]
    }

    if (input.categorySlug) {
      const category = await Category.findOne({
        slug: input.categorySlug,
      }).select("_id")
      // An unknown slug must return nothing, not everything.
      if (!category) return { items: [], total: 0, page: input.page, pages: 0 }
      where.category = category._id
    }

    if (input.sellerId) where.seller = input.sellerId
    if (input.condition) where.condition = input.condition

    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      where.price = {
        ...(input.minPrice !== undefined ? { $gte: input.minPrice } : {}),
        ...(input.maxPrice !== undefined ? { $lte: input.maxPrice } : {}),
      }
    }

    const [items, total] = await Promise.all([
      Listing.find(where)
        .sort(SORTS[input.sort])
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .populate(POPULATE)
        .lean(),
      Listing.countDocuments(where),
    ])

    return {
      items: items.map(toListingDTO),
      total,
      page: input.page,
      pages: Math.ceil(total / input.limit),
    }
  }),

  byId: publicProcedure.input(idSchema).query(async ({ input }) => {
    const listing = await Listing.findById(input.id).populate(POPULATE).lean()
    if (!listing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" })
    }
    return toListingDTO(listing)
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const listings = await Listing.find({ seller: ctx.user._id })
      .sort({ createdAt: -1 })
      .populate(POPULATE)
      .lean()
    return listings.map(toListingDTO)
  }),

  create: protectedProcedure
    .input(listingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const category = await Category.findById(input.categoryId).select("_id")
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown category",
        })
      }

      const created = await Listing.create({
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        location: input.location || null,
        category: category._id,
        // Never take the seller from client input.
        seller: ctx.user._id,
        images: input.images.map((image) => ({
          url: image.url,
          thumbUrl: image.thumbUrl ?? null,
          deleteUrl: image.deleteUrl ?? null,
        })),
      })

      return { id: String(created._id) }
    }),

  update: protectedProcedure
    .input(idSchema.extend({ data: listingInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const listing = await requireOwnedListing(input.id, ctx.user._id)

      const category = await Category.findById(input.data.categoryId).select(
        "_id",
      )
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown category",
        })
      }

      listing.set({
        title: input.data.title,
        description: input.data.description,
        price: input.data.price,
        condition: input.data.condition,
        location: input.data.location || null,
        category: category._id,
        images: input.data.images.map((image) => ({
          url: image.url,
          thumbUrl: image.thumbUrl ?? null,
          deleteUrl: image.deleteUrl ?? null,
        })),
      })
      await listing.save()

      return { id: String(listing._id) }
    }),

  setStatus: protectedProcedure
    .input(idSchema.extend({ status: z.enum(LISTING_STATUSES) }))
    .mutation(async ({ ctx, input }) => {
      const listing = await requireOwnedListing(input.id, ctx.user._id)
      listing.status = input.status
      await listing.save()
      return { id: String(listing._id), status: listing.status }
    }),

  remove: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await requireOwnedListing(input.id, ctx.user._id)

      // MongoDB has no ON DELETE CASCADE. Clean up by hand or the inbox will
      // later crash on a conversation whose listing no longer exists.
      const conversations = await Conversation.find({
        listing: listing._id,
      }).select("_id")
      const conversationIds = conversations.map((c) => c._id)

      await Promise.all([
        Favorite.deleteMany({ listing: listing._id }),
        Message.deleteMany({ conversation: { $in: conversationIds } }),
        Conversation.deleteMany({ listing: listing._id }),
      ])
      await listing.deleteOne()

      return { id: input.id }
    }),
})
