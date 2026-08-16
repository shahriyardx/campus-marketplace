import { createTRPCRouter } from "../init"
import { categoryRouter } from "./category.router"
import { favoriteRouter } from "./favorite.router"
import { listingRouter } from "./listing.router"
import { messageRouter } from "./message.router"
import { userRouter } from "./user.router"

export const appRouter = createTRPCRouter({
  category: categoryRouter,
  listing: listingRouter,
  favorite: favoriteRouter,
  message: messageRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
