"use client"

import Link from "next/link"
import { createPortal } from "react-dom"
import type { CSSProperties } from "react"
import {
  ArrowUpCircle,
  LogOut,
  Settings,
} from "lucide-react"
import { ChatAccountHelpMenu } from "@/components/chat/sidebar/chat-account-help-menu"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
  SIDEBAR_MENU_SECTION_BORDER_CLASS,
  SIDEBAR_META_TEXT_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { ROUTES } from "@/lib/routes"
import { isMacPlatform, shortcutsMenuHint } from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

interface DesktopAccountMenuPanelProps {
  open: boolean
  positionStyle: CSSProperties | null
  email?: string | null
  showUpgrade: boolean
  onClose: () => void
  onOpenSettings: () => void
  onLogoutRequest: () => void
  onKeyboardShortcuts: () => void
  onBugReport: () => void
}

/** Claude-style account menu for the native desktop shell. */
export function DesktopAccountMenuPanel({
  open,
  positionStyle,
  email,
  showUpgrade,
  onClose,
  onOpenSettings,
  onLogoutRequest,
  onKeyboardShortcuts,
  onBugReport,
}: DesktopAccountMenuPanelProps) {
  if (!open || !positionStyle || typeof document === "undefined") return null

  const settingsShortcut = shortcutsMenuHint(isMacPlatform())

  const panel = (
    <div
      role="menu"
      data-account-menu=""
      className={cn("fixed overflow-visible", SIDEBAR_MENU_PANEL_CLASS)}
      style={positionStyle}
    >
      {email ? (
        <div className="border-b border-border/50 px-3 py-2.5">
          <p className={cn("truncate", SIDEBAR_META_TEXT_CLASS)}>{email}</p>
        </div>
      ) : null}

      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onOpenSettings()
            onClose()
          }}
          className={SIDEBAR_MENU_ITEM_CLASS}
        >
          <Settings className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left">Settings</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{settingsShortcut}</span>
        </button>

        <ChatAccountHelpMenu
          onClose={onClose}
          useFixedFlyout={false}
          onAction={(action) => {
            if (action === "keyboard-shortcuts") onKeyboardShortcuts()
            if (action === "report-bug") onBugReport()
          }}
        />
      </div>

      {showUpgrade ? (
        <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1")}>
          <Link href={ROUTES.billing} role="menuitem" onClick={onClose} className={SIDEBAR_MENU_ITEM_CLASS}>
            <ArrowUpCircle className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
            <span className="flex-1 truncate">Upgrade plan</span>
          </Link>
        </div>
      ) : null}

      <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1")}>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose()
            onLogoutRequest()
          }}
          className={SIDEBAR_MENU_ITEM_CLASS}
        >
          <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left">Log out</span>
        </button>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
