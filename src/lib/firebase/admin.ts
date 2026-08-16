import "server-only"
import { type App, cert, getApps, initializeApp } from "firebase-admin/app"
import { type Auth, getAuth } from "firebase-admin/auth"
import { env } from "@/lib/env"

let adminApp: App | null = null

function getAdminApp() {
  if (adminApp) return adminApp
  if (getApps().length) {
    adminApp = getApps()[0]
    return adminApp
  }

  const projectId = env.FIREBASE_PROJECT_ID
  const clientEmail = env.FIREBASE_CLIENT_EMAIL
  // The service-account JSON stores the key with literal \n escapes.
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase admin config is missing. Fill FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env",
    )
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
  return adminApp
}

// Lazy so that importing this module never throws at build time - only an actual
// auth call fails, and with a readable message.
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}
