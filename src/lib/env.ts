import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

// Firebase and imgbb keys are optional at boot so the app still starts before the
// Firebase project is configured. Each consumer guards on its own keys and throws a
// clear error instead, see src/lib/firebase/*.ts and src/app/api/upload/route.ts.
const optionalKey = z.string().optional()

export const env = createEnv({
  server: {
    MONGODB_URI: z.string().min(1),
    FIREBASE_PROJECT_ID: optionalKey,
    FIREBASE_CLIENT_EMAIL: optionalKey,
    FIREBASE_PRIVATE_KEY: optionalKey,
    IMGBB_API_KEY: optionalKey,
  },
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: optionalKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalKey,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalKey,
    NEXT_PUBLIC_FIREBASE_APP_ID: optionalKey,
    NEXT_PUBLIC_BASE_URL: z.string().optional(),
  },
  runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
})
