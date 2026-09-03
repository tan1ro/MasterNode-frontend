"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isSignedIn, subscribeAuth } from "@/lib/app-auth"
import { isProtectedPath } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"

/**
 * Client-side backstop for protected workspace routes. Middleware should block
 * guests first; this covers stale SSR HTML and orphaned cookies after logout.
 */
export function RequireAuthenticatedRoute() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!pathname || !isProtectedPath(pathname)) return

    const redirectGuest = () => {
      if (isSignedIn()) return
      // Desktop uses the native Sign In shell — never the marketing /sign-in page.
      if (typeof window.masternodeDesktop?.returnToWelcome === "function") {
        void window.masternodeDesktop.returnToWelcome({ screen: "signin" })
        return
      }
      const params = new URLSearchParams({ redirect_url: pathname })
      router.replace(`${ROUTES.signIn}?${params.toString()}`)
    }

    redirectGuest()
    return subscribeAuth(redirectGuest)
  }, [pathname, router])

  return null
}
