import { toCategoryDTO } from "@/lib/serialize"
import { Category } from "@/models"
import { createTRPCRouter, publicProcedure } from "../init"

export const categoryRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const categories = await Category.find().sort({ name: 1 }).lean()
    return categories.map(toCategoryDTO)
  }),
})
