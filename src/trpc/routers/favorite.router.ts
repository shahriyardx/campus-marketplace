import { TRPCError } from "@trpc/server"
import { idSchema } from "@/lib/schemas"
import { toListingDTO } from "@/lib/serialize"
import { Favorite, Listing } from "@/models"
import { createTRPCRouter, protectedProcedure } from "../init"

export const favoriteRouter = createTRPCRouter({
  /** Ids of everything the caller has favorited, for filling in hearts cheaply. */
  ids: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await Favorite.find({ user: ctx.user._id })
      .select("listing")
      .lean()
    return favorites.map((favorite) => String(favorite.listing))
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await Favorite.find({ user: ctx.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "listing",
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "seller", select: "name image campus bio createdAt" },
        ],
      })
      .lean()

    // A listing deleted outside the cascade would leave a null here; skip those
    // instead of rendering a broken card.
    return favorites
      .filter((favorite) => favorite.listing)
      .map((favorite) => toListingDTO(favorite.listing))
  }),

  toggle: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await Listing.findById(input.id).select("_id")
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" })
      }

      const existing = await Favorite.findOneAndDelete({
        user: ctx.user._id,
        listing: listing._id,
      })

      if (existing) return { favorited: false }

      await Favorite.create({ user: ctx.user._id, listing: listing._id })
      return { favorited: true }
    }),
})
