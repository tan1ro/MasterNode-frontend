"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { requestChatIntroRestart } from "@/lib/chat-intro-tour"
import { ROUTES } from "@/lib/routes"

export function useRestartChatIntroTour(): {
  canRestart: boolean
  restartTour: () => void
} {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isSignedIn } = useAppAuth()
  const { closeSettings } = useAppShell()

  const tenantId = user?.id?.trim() ?? ""
  const canRestart = isSignedIn && Boolean(tenantId)

  const restartTour = useCallback(() => {
    if (!tenantId) return

    // Close the settings panel first so the tour isn't hidden behind it.
    closeSettings()

    if (!pathname.startsWith(ROUTES.chat)) {
      // Persist the request before navigating; the chat page consumes it on mount.
      requestChatIntroRestart(tenantId)
      router.push(ROUTES.chat)
      return
    }

    // Already on chat: let the settings panel unmount and the URL settle before
    // launching, otherwise the settings-sync effect can briefly re-open it.
    window.setTimeout(() => requestChatIntroRestart(tenantId), 60)
  }, [closeSettings, pathname, router, tenantId])

  return { canRestart, restartTour }
}
