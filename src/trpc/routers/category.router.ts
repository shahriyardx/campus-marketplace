import { toCategoryDTO } from "@/lib/serialize"
import { Category, Listing } from "@/models"
import { createTRPCRouter, publicProcedure } from "../init"

export const categoryRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    // One aggregate for all counts rather than a query per category. Only
    // AVAILABLE items count, so a category full of sold books reads as empty.
    const [categories, counts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Listing.aggregate<{ _id: unknown; count: number }>([
        { $match: { status: "AVAILABLE" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ])

    const countBySlug = new Map(
      counts.map((row) => [String(row._id), row.count]),
    )

    return categories.map((category) => ({
      ...toCategoryDTO(category),
      listingCount: countBySlug.get(String(category._id)) ?? 0,
    }))
  }),
})
