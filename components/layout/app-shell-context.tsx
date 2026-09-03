"use client"

import { createContext, useContext } from "react"
import type { ComposerShellMode } from "@/components/chat/chat-composer-mode-toggle"

export interface AppShellContextValue {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  settingsOpen: boolean
  settingsSection: string | null
  openSettings: (section?: string) => void
  closeSettings: () => void
  chatSearchOpen: boolean
  openChatSearch: () => void
  closeChatSearch: () => void
  keyboardShortcutsOpen: boolean
  openKeyboardShortcuts: () => void
  closeKeyboardShortcuts: () => void
  bugReportOpen: boolean
  openBugReport: () => void
  closeBugReport: () => void
  ghostModeEnabled: boolean
  setGhostModeEnabled: (enabled: boolean) => void
  incognitoIntroOpen: boolean
  openIncognitoIntro: () => void
  closeIncognitoIntro: () => void
  composerMode: ComposerShellMode
  setComposerMode: (mode: ComposerShellMode) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function AppShellProvider({
  value,
  children,
}: {
  value: AppShellContextValue
  children: React.ReactNode
}) {
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellLayout")
  }
  return ctx
}

/** Safe when page may render outside the shell (e.g. tests). */
export function useAppShellOptional(): AppShellContextValue | null {
  return useContext(AppShellContext)
}

/** Matches Tailwind `lg` — mobile drawer vs desktop rail. */
export const APP_SHELL_MOBILE_MEDIA_QUERY = "(max-width: 1023px)"

export function isAppShellMobileViewport(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(APP_SHELL_MOBILE_MEDIA_QUERY).matches
}

/** Collapse the mobile sidebar drawer after a page change or in-app navigation. */
export function closeAppShellSidebarIfMobile(
  setSidebarOpen: AppShellContextValue["setSidebarOpen"]
): void {
  if (!isAppShellMobileViewport()) return
  setSidebarOpen(false)
}
