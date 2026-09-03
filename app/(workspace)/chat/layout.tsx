"use client"

import type { ReactNode } from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { AccessDeniedBanner } from "@/components/layout/access-denied-banner"
import { ChatWorkspace } from "@/components/chat/chat-workspace"
import { isChatPricingRoute } from "@/lib/chat-path"

/**
 * Keeps a single `ChatWorkspace` mounted across `/chat` and `/chat/[chatId]`
 * so the first-message URL update does not abort an in-flight SSE stream.
 * Pricing routes render their own page instead of the composer.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const pricingRoute = isChatPricingRoute(pathname)

  if (pricingRoute) {
    return children
  }

  return (
    <>
      <Suspense fallback={null}>
        <AccessDeniedBanner />
      </Suspense>
      <ChatWorkspace />
      {children}
    </>
  )
}
