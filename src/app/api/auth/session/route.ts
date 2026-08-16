import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/constants"
import { connectDB } from "@/lib/db"
import { getAdminAuth } from "@/lib/firebase/admin"
import { User } from "@/models"

/**
 * Exchanges a short-lived Firebase ID token for an httpOnly session cookie.
 * Session cookies (rather than an Authorization header) are what let server
 * components and middleware see the logged-in user.
 */
export async function POST(request: Request) {
  let idToken: unknown
  let displayName: unknown
  try {
    const body = await request.json()
    idToken = body?.idToken
    displayName = body?.name
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
  }

  const adminAuth = getAdminAuth()

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  if (!decoded.email) {
    return NextResponse.json(
      { error: "This account has no email address" },
      { status: 400 },
    )
  }

  await connectDB()

  // Upsert on the Firebase uid: the same person signing in again must not create
  // a second user document. Name/image are only set on insert so a profile edit
  // is not overwritten by the Google profile on the next login.
  await User.updateOne(
    { uid: decoded.uid },
    {
      $set: { email: decoded.email },
      $setOnInsert: {
        name:
          (typeof displayName === "string" && displayName.trim()) ||
          decoded.name ||
          decoded.email.split("@")[0],
        image: decoded.picture ?? null,
      },
    },
    { upsert: true },
  )

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
