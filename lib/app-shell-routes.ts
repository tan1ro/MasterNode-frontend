import { ROUTES } from "@/lib/routes"
import type { AppAccountType } from "@/lib/account-types"

/** Routes that use the chat sidebar shell (all signed-in roles on /chat). */
export const CHAT_SHELL_ROUTE_PREFIXES = ["/chat"] as const

/** Creator routes that also use the chat sidebar shell. */
export const CREATOR_APP_SHELL_ROUTE_PREFIXES = [
  ...CHAT_SHELL_ROUTE_PREFIXES,
  "/tasks",
  "/assistants",
  "/memory",
  "/integrations",
  "/billing",
] as const

/**
 * Business / superuser routes that use the same sidebar shell as creators
 * (no sticky hub topnav).
 */
export const HUB_APP_SHELL_ROUTE_PREFIXES = [
  ...CHAT_SHELL_ROUTE_PREFIXES,
  "/dashboard",
  "/product",
  "/tasks",
  "/assistants",
  "/memory",
  "/integrations",
  "/billing",
  "/analytics",
  "/api-keys",
  "/logs",
  "/team",
  "/settings",
  "/llm-strategy",
  "/superuser",
] as const

/** @deprecated Use CREATOR_APP_SHELL_ROUTE_PREFIXES */
export const APP_SHELL_ROUTE_PREFIXES = CREATOR_APP_SHELL_ROUTE_PREFIXES

export function isHubDashboardRoute(pathname: string | null | undefined): boolean {
  return pathname === ROUTES.dashboard
}

export function isChatShellRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return CHAT_SHELL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function isChatConversationRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (pathname === ROUTES.chat) return true
  if (isHubDashboardRoute(pathname)) return false
  return pathname.startsWith(`${ROUTES.chat}/`)
}

function matchesRoutePrefixes(
  pathname: string,
  prefixes: readonly string[]
): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function isAppShellRoute(
  pathname: string | null | undefined,
  _accountType?: AppAccountType | string | null,
  _isSuperUser = false
): boolean {
  if (!pathname) return false
  // All signed-in app pages under `(workspace)` use the sidebar shell.
  // Path-based so SSR/hydration does not flash the topnav before role loads.
  return matchesRoutePrefixes(pathname, HUB_APP_SHELL_ROUTE_PREFIXES)
}

export function isHomeLandingRoute(pathname: string | null | undefined): boolean {
  return pathname === ROUTES.home || pathname === "/home-swiss"
}

/** Public/marketing route prefixes that share the transparent site navbar. */
export const PUBLIC_SITE_ROUTE_PREFIXES = [
  "/docs",
  "/api/docs",
  "/help",
  "/support",
  "/contact",
  "/about",
  "/platform",
  "/solutions",
  "/legal",
  "/blog",
  "/release-notes",
  "/community",
  "/pricing",
  "/download",
  "/changelog",
  "/share",
] as const

/**
 * Public/marketing pages that render the unified transparent `SiteTopNav`
 * (home + marketing content). Excludes the signed-in app shell, hub ops
 * pages, auth, onboarding, and error routes.
 */
export function isPublicSiteRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (isHomeLandingRoute(pathname)) return true
  return PUBLIC_SITE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function isAuthRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return (
    pathname === ROUTES.signIn ||
    pathname.startsWith(`${ROUTES.signIn}/`) ||
    pathname === ROUTES.signUp ||
    pathname.startsWith(`${ROUTES.signUp}/`) ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword ||
    pathname.startsWith(`${ROUTES.resetPassword}/`) ||
    pathname === "/auth/oauth" ||
    pathname.startsWith("/auth/oauth/")
  )
}

export function isOnboardingRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === ROUTES.onboarding || pathname.startsWith(`${ROUTES.onboarding}/`)
}

export function isErrorRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === ROUTES.errorsIndex || pathname.startsWith(`${ROUTES.errorsIndex}/`)
}

export function shouldHideGlobalChrome(
  pathname: string | null | undefined,
  _accountType?: AppAccountType | string | null,
  _isSuperUser = false
): boolean {
  if (!pathname) return false
  if (isOnboardingRoute(pathname)) return true
  if (isHomeLandingRoute(pathname)) return true
  if (isAuthRoute(pathname)) return true
  if (isErrorRoute(pathname)) return true
  return isAppShellRoute(pathname)
}

/**
 * Hub sticky topnav is retired — business / superuser use the sidebar shell.
 * Kept for call sites; always false.
 */
export function shouldShowHubTopNav(
  _pathname?: string | null,
  _accountType?: AppAccountType | string | null,
  _isSuperUser = false
): boolean {
  return false
}
