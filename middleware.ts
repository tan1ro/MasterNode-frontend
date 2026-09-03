import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROLE_HOME, isAuthEntryPath, isProtectedPath } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"
import { SUPERUSER_COOKIE_KEY } from "@/lib/auth-constants"
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/auth-session"
import {
  hasAuthenticatedSession,
  parseLegacyRole,
  resolveProtectedAccess,
} from "@/lib/middleware-auth"

function isSuperuserRequest(req: NextRequest, sessionIsSuperuser: boolean): boolean {
  if (sessionIsSuperuser) return true
  return req.cookies.get(SUPERUSER_COOKIE_KEY)?.value === "1"
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === "/chat/dashboard" || pathname.startsWith("/chat/dashboard/")) {
    const u = new URL(req.url)
    u.pathname = ROUTES.dashboard
    return NextResponse.redirect(u)
  }

  if (pathname === "/home-swiss" || pathname.startsWith("/home-swiss/")) {
    const u = new URL(req.url)
    u.pathname = ROUTES.home
    return NextResponse.redirect(u)
  }

  if (pathname === "/rag" || pathname.startsWith("/rag/")) {
    const u = new URL(req.url)
    u.pathname = ROUTES.memory
    return NextResponse.redirect(u)
  }

  if (pathname === "/knowledge" || pathname.startsWith("/knowledge/")) {
    const u = new URL(req.url)
    u.pathname = ROUTES.memory
    return NextResponse.redirect(u)
  }

  if (pathname === "/memory-kb" || pathname.startsWith("/memory-kb/")) {
    const u = new URL(req.url)
    u.pathname = ROUTES.memory
    return NextResponse.redirect(u)
  }

  if (
    pathname === "/agent-templates" ||
    pathname.startsWith("/agent-templates/") ||
    pathname === "/agents" ||
    pathname.startsWith("/agents/")
  ) {
    const u = new URL(req.url)
    u.pathname = "/assistants"
    return NextResponse.redirect(u)
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/__nextjs") ||
    pathname.includes("__webpack_hmr") ||
    pathname.endsWith(".hot-update.json")
  ) {
    return NextResponse.next()
  }

  if (req.headers.get("upgrade") === "websocket") {
    return NextResponse.next()
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySessionToken(sessionToken)
  const legacyRole = parseLegacyRole(req.cookies.get("mn_auth_role")?.value)
  const legacySessionId = req.cookies.get("mn_auth_session_user_id")?.value?.trim()
  const hasSession = hasAuthenticatedSession(session, legacySessionId, legacyRole)

  // Always allow sign-in / sign-up / onboarding to render. Client-side guards redirect truly
  // signed-in users; orphaned HttpOnly cookies must not block the auth forms.
  if (isAuthEntryPath(pathname)) {
    if (pathname === ROUTES.onboarding && !hasSession) {
      const authUrl = new URL(ROUTES.signIn, req.url)
      authUrl.searchParams.set("redirect_url", pathname)
      return NextResponse.redirect(authUrl)
    }
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) return NextResponse.next()

  const decision = resolveProtectedAccess({
    pathname,
    session,
    legacySessionId,
    legacyRole,
    isSuperuser: isSuperuserRequest(req, Boolean(session?.isSuperuser)),
  })

  if (decision === "allow") return NextResponse.next()

  if (decision === "role_home") {
    const role = session?.role ?? legacyRole
    const home = role ? ROLE_HOME[role] : ROUTES.chat
    const homeUrl = new URL(home, req.url)
    homeUrl.searchParams.set("denied", pathname)
    return NextResponse.redirect(homeUrl)
  }

  const authPath = decision === "sign_up" ? ROUTES.signUp : ROUTES.signIn
  const authUrl = new URL(authPath, req.url)
  authUrl.searchParams.set("redirect_url", pathname)
  return NextResponse.redirect(authUrl)
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
