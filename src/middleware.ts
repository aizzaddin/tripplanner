import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth
  const token = req.auth

  const isAuthPage = nextUrl.pathname.startsWith("/auth")
  const isProtectedPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/trips") ||
    nextUrl.pathname.startsWith("/admin")
  const isPendingPage = nextUrl.pathname === "/pending"

  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl))
  }

  if (isAuthenticated) {
    const status = token?.user?.status as string | undefined

    // Redirect PENDING users away from protected pages
    if (status === "PENDING" && isProtectedPage && !isPendingPage) {
      return NextResponse.redirect(new URL("/pending", nextUrl))
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
