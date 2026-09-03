"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { AccessDeniedBanner } from "@/components/layout/access-denied-banner"
import { isAppShellRoute } from "@/lib/app-shell-routes"
import { useAppAuth } from "@/hooks/use-app-auth"

function AccessDeniedBannerSlotInner() {
  const pathname = usePathname()
  const { accountType, isSuperUser } = useAppAuth()
  if (isAppShellRoute(pathname, accountType, isSuperUser)) return null

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6">
      <AccessDeniedBanner />
    </div>
  )
}

export function AccessDeniedBannerSlot() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedBannerSlotInner />
    </Suspense>
  )
}
