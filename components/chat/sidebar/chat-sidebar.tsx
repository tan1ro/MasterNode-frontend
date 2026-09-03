"use client"

import { useEffect, useRef } from "react"
import { ChatSidebarGuestChatsSection } from "@/components/chat/chat-sidebar-guest"
import { ChatSidebarFooter } from "@/components/chat/sidebar/chat-sidebar-footer"
import { ChatSidebarHeader } from "@/components/chat/sidebar/chat-sidebar-header"
import { ChatSidebarNav } from "@/components/chat/sidebar/chat-sidebar-nav"
import { ChatSidebarRail } from "@/components/chat/sidebar/chat-sidebar-rail"
import { ChatSidebarRecents } from "@/components/chat/sidebar/chat-sidebar-recents"
import {
  SIDEBAR_ASIDE_CLASS,
  SIDEBAR_FOOTER_CLASS,
  SIDEBAR_PANEL_TRANSITION_CLASS,
  SIDEBAR_RAIL_WIDTH_CLASS,
  SIDEBAR_TRANSITION_CLASS,
  SIDEBAR_WIDTH_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { ChatConversation } from "@/types/api"

export interface ChatSidebarProps {
  open: boolean
  onToggle: () => void
  conversations: ChatConversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onCreateChat: () => void
}

export function ChatSidebar({
  open,
  onToggle,
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateChat,
}: ChatSidebarProps) {
  const { isSignedIn } = useAppAuth()
  const { openChatSearch } = useAppShell()
  const { ToastSlot } = useToast()
  const railRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rail = railRef.current
    const panel = panelRef.current

    if (rail) {
      if (open) rail.setAttribute("inert", "")
      else rail.removeAttribute("inert")
    }
    if (panel) {
      if (!open) panel.setAttribute("inert", "")
      else panel.removeAttribute("inert")
    }

    if (open && rail?.contains(document.activeElement)) {
      ;(document.activeElement as HTMLElement | null)?.blur()
      const firstFocusable = panel?.querySelector<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }
  }, [open])

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          SIDEBAR_PANEL_TRANSITION_CLASS,
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          tabIndex={open ? 0 : -1}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          onClick={onToggle}
        />
      </div>

      <aside
        data-chat-tour="sidebar"
        data-mn-app-sidebar=""
        className={cn(
          SIDEBAR_ASIDE_CLASS,
          "lg:relative lg:w-full lg:min-w-0",
          open ? "overflow-x-hidden" : "overflow-visible",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shrink-0",
          SIDEBAR_TRANSITION_CLASS,
          open
            ? cn("w-full", SIDEBAR_WIDTH_CLASS, "max-lg:max-w-[min(17.5rem,100vw)]")
            : cn(
                SIDEBAR_RAIL_WIDTH_CLASS,
                "max-lg:w-0 max-lg:border-r-0 max-lg:overflow-hidden max-lg:pointer-events-none"
              )
        )}
      >
        <div
          ref={railRef}
          data-mn-sidebar-rail=""
          className={cn(
            "absolute inset-y-0 left-0 z-10",
            SIDEBAR_RAIL_WIDTH_CLASS,
            SIDEBAR_PANEL_TRANSITION_CLASS,
            open
              ? "pointer-events-none opacity-0 -translate-x-1"
              : "pointer-events-auto opacity-100 translate-x-0"
          )}
        >
          <ChatSidebarRail
            onToggle={onToggle}
            onCreateChat={onCreateChat}
            onOpenSearch={openChatSearch}
          />
        </div>

        <div
          ref={panelRef}
          data-mn-sidebar-panel=""
          className={cn(
            "absolute inset-0 z-20 flex h-full w-full min-w-0 max-w-full flex-col",
            SIDEBAR_PANEL_TRANSITION_CLASS,
            open
              ? "pointer-events-auto opacity-100 translate-x-0 delay-75 motion-reduce:delay-0"
              : "pointer-events-none opacity-0 -translate-x-2"
          )}
        >
          <ChatSidebarHeader onToggle={onToggle} />
          <ChatSidebarNav onCreateChat={onCreateChat} />

          {!isSignedIn ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatSidebarGuestChatsSection />
            </div>
          ) : (
            <ChatSidebarRecents
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onCreateChat={onCreateChat}
            />
          )}

          <footer className={SIDEBAR_FOOTER_CLASS}>
            <ChatSidebarFooter variant="expanded" />
          </footer>
        </div>
      </aside>
      <ToastSlot />
    </>
  )
}
