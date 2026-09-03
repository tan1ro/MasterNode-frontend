"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChatIntroTour } from "@/components/chat/chat-intro-tour"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useAuthSession } from "@/providers/auth-session-provider"
import {
  CHAT_INTRO_RESTART_EVENT,
  CHAT_TOUR_DESKTOP_MQ,
  clearPendingChatIntro,
  consumeChatIntroRestartRequest,
  isChatIntroPending,
  markChatIntroCompleted,
} from "@/lib/chat-intro-tour"
import { hydrateUserExperienceFromProfile } from "@/lib/user-experience-state"
import { authService } from "@/services/auth"

type TourSession = {
  tenantId: string
  displayName: string | null
}

export function useChatIntroTour(): ReactNode {
  const { user, hydrated, isSignedIn } = useAppAuth()
  const { authReady } = useAuthSession()
  const { setSidebarOpen } = useAppShell()
  const [session, setSession] = useState<TourSession | null>(null)
  const initialStartedRef = useRef(false)
  const launchTimerRef = useRef<number | null>(null)

  const finishTour = useCallback((tenantId: string) => {
    clearPendingChatIntro(tenantId)
    markChatIntroCompleted(tenantId)
    if (typeof window !== "undefined" && !window.matchMedia(CHAT_TOUR_DESKTOP_MQ).matches) {
      setSidebarOpen(false)
    }
    setSession(null)
  }, [setSidebarOpen])

  const launchTour = useCallback(
    (tenantId: string) => {
      if (launchTimerRef.current !== null) {
        window.clearTimeout(launchTimerRef.current)
      }
      // Only pre-open the desktop sidebar. On mobile the tour toggles the drawer
      // per step so composer/main steps aren't covered by the nav panel.
      const isDesktop =
        typeof window !== "undefined" && window.matchMedia(CHAT_TOUR_DESKTOP_MQ).matches
      if (isDesktop) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
      const displayName = user?.username?.trim() || user?.email?.split("@")[0] || null
      launchTimerRef.current = window.setTimeout(() => {
        launchTimerRef.current = null
        setSession({ tenantId, displayName })
      }, isDesktop ? 500 : 400)
    },
    [setSidebarOpen, user?.email, user?.username]
  )

  useEffect(() => {
    const tenantId = user?.id?.trim()
    if (!hydrated || !isSignedIn || !authReady || !tenantId) return

    let cancelled = false

    void authService
      .me()
      .then((profile) => {
        if (cancelled) return
        const resolvedTenantId =
          hydrateUserExperienceFromProfile(tenantId, profile) || tenantId

        const isRestart = consumeChatIntroRestartRequest(resolvedTenantId)
        if (isRestart) {
          launchTour(resolvedTenantId)
          return
        }

        if (
          initialStartedRef.current ||
          !isChatIntroPending(resolvedTenantId, profile.chat_intro_completed)
        ) {
          return
        }

        initialStartedRef.current = true
        launchTour(resolvedTenantId)
      })
      .catch(() => {
        if (cancelled) return
        if (initialStartedRef.current || !isChatIntroPending(tenantId)) return
        initialStartedRef.current = true
        launchTour(tenantId)
      })

    return () => {
      cancelled = true
    }
  }, [authReady, hydrated, isSignedIn, launchTour, user?.id])

  useEffect(() => {
    const onRestart = (event: Event) => {
      const tenantId = user?.id?.trim()
      if (!tenantId) return
      const detail = (event as CustomEvent<{ tenantId?: string }>).detail
      if (detail?.tenantId && detail.tenantId !== tenantId) return
      launchTour(tenantId)
    }

    window.addEventListener(CHAT_INTRO_RESTART_EVENT, onRestart)
    return () => window.removeEventListener(CHAT_INTRO_RESTART_EVENT, onRestart)
  }, [launchTour, user?.id])

  useEffect(
    () => () => {
      if (launchTimerRef.current !== null) {
        window.clearTimeout(launchTimerRef.current)
      }
    },
    []
  )

  if (!session) return null

  return (
    <ChatIntroTour
      displayName={session.displayName}
      onComplete={() => finishTour(session.tenantId)}
      onExit={() => finishTour(session.tenantId)}
    />
  )
}
