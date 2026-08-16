import { CATEGORIES } from "@/lib/constants"
import { Listing } from "@/models"
import { createTRPCRouter, publicProcedure } from "../init"

export const categoryRouter = createTRPCRouter({
  /**
   * The category list itself is a constant; only the counts need the database.
   * Returned in the order declared in CATEGORIES rather than alphabetically,
   * so the numbering in the UI is stable and intentional.
   */
  list: publicProcedure.query(async () => {
    const counts = await Listing.aggregate<{ _id: string; count: number }>([
      { $match: { status: "AVAILABLE" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])

    const countBySlug = new Map(counts.map((row) => [row._id, row.count]))

    return CATEGORIES.map((category) => ({
      slug: category.slug,
      name: category.name,
      icon: category.icon,
      listingCount: countBySlug.get(category.slug) ?? 0,
    }))
  }),
})
