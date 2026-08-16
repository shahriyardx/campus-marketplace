import { TRPCError } from "@trpc/server"
import { idSchema, profileInputSchema } from "@/lib/schemas"
import { toMeDTO, toPublicUserDTO } from "@/lib/serialize"
import { User } from "@/models"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => (ctx.user ? toMeDTO(ctx.user) : null)),

  publicProfile: publicProcedure.input(idSchema).query(async ({ input }) => {
    const user = await User.findById(input.id).lean()
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    }
    return toPublicUserDTO(user)
  }),

  updateProfile: protectedProcedure
    .input(profileInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Empty strings from the form mean "clear this field".
      const updated = await User.findByIdAndUpdate(
        ctx.user._id,
        {
          $set: {
            name: input.name,
            phone: input.phone || null,
            campus: input.campus || null,
            bio: input.bio || null,
            ...(input.image ? { image: input.image } : {}),
          },
        },
        { new: true },
      ).lean()

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }
      return toMeDTO(updated)
    }),
})
