import { initTRPC, TRPCError } from "@trpc/server"
import SuperJSON from "superjson"
import { connectDB } from "@/lib/db"
import { getUserFromHeaders, type SessionUser } from "@/lib/session"

export type TRPCContext = {
  user: SessionUser | null
}

export const createTRPCContext = async ({
  req,
}: {
  req: Request
}): Promise<TRPCContext> => {
  // One connect call here covers every procedure.
  await connectDB()

  return {
    user: await getUserFromHeaders(req.headers),
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
})

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authenticated",
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
