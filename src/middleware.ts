import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/constants"

// UX only: this just checks that a cookie exists, it does not verify it.
// Real enforcement lives in protectedProcedure and the ownership checks.
const PROTECTED = [
  "/listings/new",
  "/dashboard",
  "/favorites",
  "/messages",
  "/settings",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsAuth =
    PROTECTED.some((route) => pathname.startsWith(route)) ||
    /^\/listings\/[^/]+\/edit$/.test(pathname)

  if (!needsAuth) return NextResponse.next()
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/listings/:path*",
    "/dashboard/:path*",
    "/favorites/:path*",
    "/messages/:path*",
    "/settings/:path*",
  ],
}
