"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { isChatConversationRoute } from "@/lib/app-shell-routes"

/** Scrollable content column for non-chat app-shell pages. */
export function AppShellPageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isChatRoute = isChatConversationRoute(pathname)

  if (isChatRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
  )
}
