import type { NextResponse } from "next/server"
import { SUPERUSER_COOKIE_KEY } from "@/lib/auth-constants"

export const ACCESS_COOKIE = "mn_access"
export const REFRESH_COOKIE = "mn_refresh"

const isProd = process.env.NODE_ENV === "production"

function cookieBase(maxAge: number): string {
  const parts = ["Path=/", "SameSite=Lax", `Max-Age=${maxAge}`]
  if (isProd) parts.push("Secure")
  parts.push("HttpOnly")
  return parts.join("; ")
}

export function setTokenCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token?: string; expires_in?: number }
): void {
  const accessMax = tokens.expires_in ?? 3600
  res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMax,
  })
  if (tokens.refresh_token) {
    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }
}

function clearCookie(res: NextResponse, name: string, httpOnly = true): void {
  res.cookies.set(name, "", {
    httpOnly,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export function clearHttpOnlyAuthCookies(res: NextResponse): void {
  clearCookie(res, ACCESS_COOKIE)
  clearCookie(res, REFRESH_COOKIE)
  clearCookie(res, "mn_session")
}

export function clearTokenCookies(res: NextResponse): void {
  clearHttpOnlyAuthCookies(res)
  clearCookie(res, "mn_auth_session_user_id", false)
  clearCookie(res, "mn_auth_role", false)
  clearCookie(res, "mn_auth_plan", false)
  clearCookie(res, SUPERUSER_COOKIE_KEY, false)
}

export function setSessionCookie(res: NextResponse, signedSession: string): void {
  res.cookies.set("mn_session", signedSession, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}
