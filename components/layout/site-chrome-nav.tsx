"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { SiteTopNav } from "@/components/layout/site-top-nav"
import { isPublicSiteRoute } from "@/lib/app-shell-routes"

/**
 * Single top-nav entry point for the root layout.
 *
 * Public/marketing routes get the shared transparent {@link SiteTopNav}.
 * Everything else keeps the role-aware {@link Navigation} (which handles its
 * own hide logic for the chat shell, auth, onboarding, and error pages).
 */
export function SiteChromeNav() {
  const pathname = usePathname() ?? ""
  if (isPublicSiteRoute(pathname)) {
    return <SiteTopNav />
  }
  return <Navigation />
}
