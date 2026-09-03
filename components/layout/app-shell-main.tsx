"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  isAppShellRoute,
  isAuthRoute,
  isErrorRoute,
  isOnboardingRoute,
} from "@/lib/app-shell-routes"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"

/** Full-viewport main wrapper for signed-in app shell routes. */
export function AppShellMain({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { accountType } = useAppAuth()
  const { isSuperUser } = useEntitlements()
  const mounted = useMounted()
  const role = mounted ? accountType : null
  const superuser = mounted ? isSuperUser : false

  const appShell = isAppShellRoute(pathname, role, superuser)
  const fullViewportFlow =
    isAuthRoute(pathname) || isOnboardingRoute(pathname) || isErrorRoute(pathname)

  return (
    <main
      className={cn(
        "flex flex-col min-h-0",
        fullViewportFlow || appShell ? "h-dvh flex-1 overflow-hidden" : "flex-1"
      )}
    >
      {children}
    </main>
  )
}
