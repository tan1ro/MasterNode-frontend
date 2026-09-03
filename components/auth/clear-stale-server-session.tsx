"use client"

import { useEffect } from "react"
import { isSignedIn, refreshAuthCookies, subscribeAuth } from "@/lib/app-auth"
import { revokeServerSession } from "@/lib/revoke-server-session"

/**
 * Drops orphaned HttpOnly session cookies when the browser profile is logged out.
 * Without this, middleware can treat guests as signed in and bounce /sign-in → /chat.
 *
 * Uses stale-only logout so legacy dev cookies are not cleared. If the user signs in
 * while the request is in flight, cookies are restored before navigation.
 */
export function ClearStaleServerSession() {
  useEffect(() => {
    if (isSignedIn()) return

    let cancelled = false
    const unsub = subscribeAuth(() => {
      if (isSignedIn()) cancelled = true
    })

    void (async () => {
      if (cancelled || isSignedIn()) return
      await revokeServerSession({ stale: true })
      if (cancelled || isSignedIn()) {
        refreshAuthCookies()
        return
      }
    })()

    return unsub
  }, [])

  return null
}
