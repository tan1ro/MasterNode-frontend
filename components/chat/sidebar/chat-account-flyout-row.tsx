"use client"

import { useRef, type ComponentType, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ChevronRight } from "lucide-react"
import { useFlyoutHover } from "@/components/chat/sidebar/use-flyout-hover"
import { useFlyoutMenuPosition } from "@/components/chat/sidebar/use-sidebar-menu-position"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

interface ChatAccountFlyoutRowProps {
  label: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  /** Portaled fixed flyout (sidebar account menu). */
  useFixedFlyout?: boolean
  submenuLabel?: string
  className?: string
}

/** Hover-activated row with optional portaled submenu to the right. */
export function ChatAccountFlyoutRow({
  label,
  icon: Icon,
  children,
  useFixedFlyout = true,
  submenuLabel,
  className,
}: ChatAccountFlyoutRowProps) {
  const { open, onEnter, onLeave, close } = useFlyoutHover()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const flyoutStyle = useFlyoutMenuPosition(triggerRef, open && useFixedFlyout)

  const submenu = open ? (
    <div
      role="menu"
      aria-label={submenuLabel || label}
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
      {children}
    </div>
  ) : null

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(SIDEBAR_MENU_ITEM_CLASS, open && "bg-muted/50")}
        onFocus={onEnter}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            close()
          }
        }}
      >
        <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
        <span className="flex-1 truncate">{label}</span>
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
