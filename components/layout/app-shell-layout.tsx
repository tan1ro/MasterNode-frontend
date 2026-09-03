"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useKeyboardShortcutsHandler } from "@/hooks/use-keyboard-shortcuts-handler"
import { SHORTCUT_EVENT } from "@/lib/keyboard-shortcuts"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChatAppSidebar } from "@/components/chat/chat-app-sidebar"
import {
  AppShellProvider,
  closeAppShellSidebarIfMobile,
} from "@/components/layout/app-shell-context"
import { AppShellSettingsSync } from "@/components/layout/app-shell-settings-sync"
import { ChatSearchModal } from "@/components/chat/chat-search-modal"
import { ChatIncognitoIntroDialog } from "@/components/chat/chat-incognito-intro-dialog"
import { BugReportModal } from "@/components/help/bug-report-modal"
import { KeyboardShortcutsModal } from "@/components/help/keyboard-shortcuts-modal"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { useConversations } from "@/hooks/use-conversations"
import { useGhostChatMode } from "@/hooks/use-ghost-chat-mode"
import { CHAT_MAIN_TRANSITION_CLASS, CHAT_SHELL_CLASS } from "@/constants/chat-layout"
import { AppShellMobileHeader } from "@/components/layout/app-shell-mobile-header"
import { isChatConversationRoute } from "@/lib/app-shell-routes"
import { parseChatConversationIdFromPathname, requestBeginDraftChat } from "@/lib/chat-path"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

function AppShellLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<string | null>(null)
  const [chatSearchOpen, setChatSearchOpen] = useState(false)
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false)
  const [bugReportOpen, setBugReportOpen] = useState(false)
  const [incognitoIntroOpen, setIncognitoIntroOpen] = useState(false)
  const [composerMode, setComposerMode] = useState<"chat" | "pipeline">("chat")
  const { conversations, deleteConversation } = useConversations()
  const { ghostModeEnabled, setGhostModeEnabled } = useGhostChatMode()

  const activeConversationId = useMemo(
    () => parseChatConversationIdFromPathname(pathname),
    [pathname]
  )
  const isChatRoute = isChatConversationRoute(pathname)

  const beginDraftChat = useCallback(() => {
    // Always notify ChatWorkspace first: it may still hold a pendingConversationId
    // from an in-flight first message, which would otherwise keep showing the old thread
    // when navigation to `/chat` is a no-op (already there) or races with replace.
    requestBeginDraftChat()
    closeAppShellSidebarIfMobile(setSidebarOpen)
    router.push(ROUTES.chat)
  }, [router])

  useEffect(() => {
    closeAppShellSidebarIfMobile(setSidebarOpen)
  }, [pathname])

  const openSettings = useCallback(
    (section?: string) => {
      closeAppShellSidebarIfMobile(setSidebarOpen)
      setSettingsOpen(true)
      setSettingsSection(section ?? null)
      const params = new URLSearchParams(searchParams.toString())
      params.set("settings", "1")
      if (section?.trim()) params.set("section", section.trim())
      else params.delete("section")
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const closeSettings = useCallback(() => {
    setSettingsOpen(false)
    setSettingsSection(null)
    const params = new URLSearchParams(searchParams.toString())
    if (!params.has("settings") && !params.has("section")) return
    params.delete("settings")
    params.delete("section")
    const q = params.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const openChatSearch = useCallback(() => {
    closeAppShellSidebarIfMobile(setSidebarOpen)
    setChatSearchOpen(true)
  }, [])
  const closeChatSearch = useCallback(() => setChatSearchOpen(false), [])
  const openKeyboardShortcuts = useCallback(() => setKeyboardShortcutsOpen(true), [])
  const closeKeyboardShortcuts = useCallback(() => setKeyboardShortcutsOpen(false), [])
  const openBugReport = useCallback(() => setBugReportOpen(true), [])
  const closeBugReport = useCallback(() => setBugReportOpen(false), [])
  const openIncognitoIntro = useCallback(() => setIncognitoIntroOpen(true), [])
  const closeIncognitoIntro = useCallback(() => setIncognitoIntroOpen(false), [])
  const confirmIncognitoIntro = useCallback(() => {
    setGhostModeEnabled(true)
    setIncognitoIntroOpen(false)
  }, [setGhostModeEnabled])

  useKeyboardShortcutsHandler(true)

  useEffect(() => {
    function onShortcut(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id
      if (!id) return

      switch (id) {
        case "search-chats":
          setChatSearchOpen(true)
          break
        case "show-shortcuts":
          setKeyboardShortcutsOpen(true)
          break
        case "new-chat":
          beginDraftChat()
          break
        case "toggle-sidebar":
          setSidebarOpen((open) => !open)
          break
        case "open-settings":
          openSettings()
          break
        case "incognito-chat":
          if (ghostModeEnabled) {
            setGhostModeEnabled(false)
          } else {
            openIncognitoIntro()
          }
          break
        default:
          break
      }
    }

    window.addEventListener(SHORTCUT_EVENT, onShortcut)
    return () => window.removeEventListener(SHORTCUT_EVENT, onShortcut)
  }, [beginDraftChat, ghostModeEnabled, openIncognitoIntro, openSettings, setGhostModeEnabled])

  const shellValue = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      settingsOpen,
      settingsSection,
      openSettings,
      closeSettings,
      chatSearchOpen,
      openChatSearch,
      closeChatSearch,
      keyboardShortcutsOpen,
      openKeyboardShortcuts,
      closeKeyboardShortcuts,
      bugReportOpen,
      openBugReport,
      closeBugReport,
      ghostModeEnabled,
      setGhostModeEnabled,
      incognitoIntroOpen,
      openIncognitoIntro,
      closeIncognitoIntro,
      composerMode,
      setComposerMode,
    }),
    [
      sidebarOpen,
      settingsOpen,
      settingsSection,
      openSettings,
      closeSettings,
      chatSearchOpen,
      openChatSearch,
      closeChatSearch,
      keyboardShortcutsOpen,
      openKeyboardShortcuts,
      closeKeyboardShortcuts,
      bugReportOpen,
      openBugReport,
      closeBugReport,
      ghostModeEnabled,
      setGhostModeEnabled,
      incognitoIntroOpen,
      openIncognitoIntro,
      closeIncognitoIntro,
      composerMode,
    ]
  )

  return (
    <AppShellProvider value={shellValue}>
      <AppShellSettingsSync />
      <div
        className={cn(
          CHAT_SHELL_CLASS,
          "grid grid-cols-[minmax(0,1fr)]",
          CHAT_MAIN_TRANSITION_CLASS,
          sidebarOpen
            ? "lg:grid-cols-[17.5rem_minmax(0,1fr)]"
            : "lg:grid-cols-[4rem_minmax(0,1fr)]"
        )}
      >
        <ChatAppSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onCreateChat={beginDraftChat}
          onSelectConversation={(id) => {
            closeAppShellSidebarIfMobile(setSidebarOpen)
            router.replace(ROUTES.chatConversation(id), { scroll: false })
          }}
        />
        <div
          data-chat-main-pane=""
          className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-background"
        >
          <AppShellMobileHeader chatRoute={isChatRoute} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-hidden">
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
      <SettingsPanel />
      <KeyboardShortcutsModal open={keyboardShortcutsOpen} onClose={closeKeyboardShortcuts} />
      <BugReportModal open={bugReportOpen} onClose={closeBugReport} />
      <ChatIncognitoIntroDialog
        open={incognitoIntroOpen}
        onOpenChange={(open) => (open ? openIncognitoIntro() : closeIncognitoIntro())}
        onContinue={confirmIncognitoIntro}
      />
      <ChatSearchModal
        open={chatSearchOpen}
        onClose={closeChatSearch}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          closeAppShellSidebarIfMobile(setSidebarOpen)
          router.replace(ROUTES.chatConversation(id), { scroll: false })
        }}
        onDeleteConversation={(id) => {
          void deleteConversation.mutateAsync(id).then(() => {
            if (activeConversationId === id) {
              beginDraftChat()
            }
          })
        }}
      />
    </AppShellProvider>
  )
}

export function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShellLayoutInner>{children}</AppShellLayoutInner>
    </Suspense>
  )
}
