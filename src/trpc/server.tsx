import "server-only" // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from "@trpc/react-query/rsc"
import { headers } from "next/headers"
import { cache } from "react"
import { createCallerFactory, createTRPCContext } from "./init"
import { makeQueryClient } from "./query-client"
import { appRouter } from "./routers/_app"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient)

const caller = createCallerFactory(appRouter)(async () => {
  // headers() is async in Next 16 - awaiting it matters, the context reads the
  // cookie header off this object.
  const requestHeaders = await headers()
  return createTRPCContext({
    req: new Request("http://rsc.local", { headers: requestHeaders }),
  })
})

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
)
