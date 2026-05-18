import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import { ratelimit } from "@/lib/redis"

const { auth } = NextAuth(authConfig)

export const proxy = auth(async (req) => {
  const requestId = crypto.randomUUID()
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isWebhookRoute = nextUrl.pathname.startsWith("/api/webhooks")
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register"
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname === "/billing" ||
    nextUrl.pathname === "/logs" ||
    nextUrl.pathname === "/settings"
  const isAdminRoute =
    nextUrl.pathname.startsWith("/dashboard/admin") ||
    nextUrl.pathname.startsWith("/admin")

  // Skip for webhooks
  if (isWebhookRoute) {
    const res = NextResponse.next()
    res.headers.set("x-request-id", requestId)
    return res
  }

  // API routes: optional rate limiting
  if (isApiRoute) {
    if (ratelimit) {
      const apiKey = req.headers.get("x-api-key")
      const identifier = apiKey || req.auth?.user?.id || req.headers.get("x-forwarded-for") || "anonymous"
      try {
        const { success } = await ratelimit.limit(identifier)
        if (!success) {
          return NextResponse.json({ error: "Too many requests" }, { status: 429 })
        }
      } catch {
        // Redis unavailable — allow through
      }
    }
    const res = NextResponse.next()
    res.headers.set("x-request-id", requestId)
    return res
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Protect all app routes
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Admin-only guard
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  const res = NextResponse.next()
  res.headers.set("x-request-id", requestId)
  return res
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)", "/api/((?!auth).*)"],
}
