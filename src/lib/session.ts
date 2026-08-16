import "server-only"
import { cookies } from "next/headers"
import { SESSION_COOKIE } from "./constants"
import { connectDB } from "./db"
import { getAdminAuth } from "./firebase/admin"
import { User, type UserDoc } from "@/models"

export type SessionUser = UserDoc

function readSessionCookie(headers: Headers) {
  const raw = headers.get("cookie")
  if (!raw) return null

  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="))
  }
  return null
}

/**
 * Verifies the Firebase session cookie and returns the matching Mongo user.
 * Returns null for every failure mode (no cookie, expired, revoked, unknown user)
 * so callers only ever branch on presence.
 */
export async function getUserFromHeaders(
  headers: Headers,
): Promise<SessionUser | null> {
  const sessionCookie = readSessionCookie(headers)
  if (!sessionCookie) return null

  try {
    // checkRevoked: true so signing out on another device really ends the session.
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    )
    await connectDB()
    return await User.findOne({ uid: decoded.uid })
  } catch {
    return null
  }
}

/** Server-component / route-handler flavour of {@link getUserFromHeaders}. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    )
    await connectDB()
    return await User.findOne({ uid: decoded.uid })
  } catch {
    return null
  }
}
