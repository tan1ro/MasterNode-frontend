"use client"

import { useRef } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Plus } from "lucide-react"
import { useFlyoutHover } from "@/components/chat/sidebar/use-flyout-hover"
import { useFlyoutMenuPosition } from "@/components/chat/sidebar/use-sidebar-menu-position"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
  SIDEBAR_META_TEXT_CLASS,
  SIDEBAR_TEXT_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import type { PlanAccent } from "@/lib/plan-display"
import { cn } from "@/lib/utils"

interface ChatAccountProfileFlyoutProps {
  initial: string
  displayName: string
  shortPlan: string
  accent: PlanAccent
  email?: string | null
  useFixedFlyout?: boolean
  onClose: () => void
  onManageAccount: () => void
}

/** ChatGPT-style profile row at top of account menu with account switcher flyout. */
export function ChatAccountProfileFlyout({
  initial,
  displayName,
  shortPlan,
  accent,
  email,
  useFixedFlyout = true,
  onClose,
  onManageAccount,
}: ChatAccountProfileFlyoutProps) {
  const { open, onEnter, onLeave, close } = useFlyoutHover()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const flyoutStyle = useFlyoutMenuPosition(triggerRef, open && useFixedFlyout)

  const submenu = open ? (
    <div
      role="menu"
      aria-label="Accounts"
      data-account-menu=""
      className={cn(
        useFixedFlyout ? "fixed" : "absolute left-full top-0 ml-0.5",
        "z-[210] min-w-[14.5rem]",
        SIDEBAR_MENU_PANEL_CLASS
      )}
      style={useFixedFlyout ? flyoutStyle ?? undefined : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {email ? (
        <div className="border-b border-border/50 px-3 py-2.5">
          <p className={cn("truncate", SIDEBAR_META_TEXT_CLASS)}>{email}</p>
        </div>
      ) : null}
      <div className="py-1">
        <div
          role="menuitem"
          aria-current="true"
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
        >
          <span
            aria-hidden
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1",
              accent.avatar,
              accent.ring
            )}
          >
            {initial}
          </span>
          <span className={cn("min-w-0 flex-1 truncate font-medium", SIDEBAR_TEXT_CLASS)}>
            {displayName}
          </span>
          <Check className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
        </div>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onManageAccount()
            onClose()
          }}
          className={SIDEBAR_MENU_ITEM_CLASS}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left">Manage account</span>
        </button>
      </div>
    </div>
  ) : null

  return (
    <div
      className="border-b border-border/50 px-1 py-1"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left",
          "hover:bg-muted/60 transition-colors",
          open && "bg-muted/60"
        )}
        onFocus={onEnter}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            close()
          }
        }}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1",
            accent.avatar,
            accent.ring
          )}
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-medium text-foreground", SIDEBAR_TEXT_CLASS)}>
            {displayName}
          </span>
          <span className={cn("block truncate font-medium", SIDEBAR_META_TEXT_CLASS, accent.text)}>
            {shortPlan}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {useFixedFlyout && typeof document !== "undefined"
        ? submenu
          ? createPortal(submenu, document.body)
          : null
        : submenu}
    </div>
  )
}
