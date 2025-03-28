import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Add paths that require authentication
const protectedPaths = ["/dashboard", "/profile"]

// Add paths that should redirect to dashboard if already authenticated
const authPaths = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || ""
  const pathname = request.nextUrl.pathname

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname === path)

  // Verify the token
  const verifiedToken = token ? await verifyToken(token) : null

  // Redirect to login if accessing protected path without valid token
  if (isProtectedPath && !verifiedToken) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth paths with valid token
  if (isAuthPath && verifiedToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

