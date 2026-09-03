"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

function nativeAuthScreen(pathname: string | null): "signin" | "signup" | "forgot" | null {
  if (!pathname) return null
  const path = pathname.replace(/\/$/, "") || "/"
  if (path === "/sign-in" || path.startsWith("/sign-in/")) return "signin"
  if (path === "/sign-up" || path.startsWith("/sign-up/")) return "signup"
  if (path === "/forgot-password") return "forgot"
  return null
}

/**
 * Desktop never renders the marketing auth pages. Logout and guest redirects
 * bounce into the native welcome / sign-in / sign-up shell instead.
 */
export function DesktopNativeAuthGate() {
  const pathname = usePathname()

  useEffect(() => {
    const screen = nativeAuthScreen(pathname)
    const bounce = window.masternodeDesktop?.returnToWelcome
    if (!screen || typeof bounce !== "function") return
    void bounce({ screen })
  }, [pathname])

  return null
}
