"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
  SIDEBAR_ACTIONS_COLUMN_CLASS,
  SIDEBAR_RECENTS_ACTIONS_COLUMN_CLASS,
  SIDEBAR_ICON_CLASS,
  SIDEBAR_ICON_SLOT_CLASS,
  SIDEBAR_NAV_LABEL_CLASS,
  SIDEBAR_RECENTS_LABEL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

const ICON_STROKE = 1.75

/** Icon column cell for nav rows and section headers. */
export function SidebarRowIcon({
  icon: Icon,
  active = false,
  alwaysAmber = false,
  className,
  iconClassName,
}: {
  icon: LucideIcon
  active?: boolean
  alwaysAmber?: boolean
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn(SIDEBAR_ICON_SLOT_CLASS, className)}>
      <Icon
        className={cn(
          SIDEBAR_ICON_CLASS,
          alwaysAmber || active ? "text-amber" : "text-foreground/75",
          iconClassName
        )}
        strokeWidth={ICON_STROKE}
        aria-hidden
      />
    </span>
  )
}

/** Label cell for nav rows (column 2 via auto-placement). */
export function SidebarNavLabel({ children }: { children: ReactNode }) {
  return <span className={SIDEBAR_NAV_LABEL_CLASS}>{children}</span>
}

/** Label cell for recents rows and section headers (column 2). */
export function SidebarRecentsLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={cn(SIDEBAR_RECENTS_LABEL_CLASS, className)}>{children}</span>
}

/** Trailing actions cell for recents rows (column 2). */
export function SidebarRowActions({
  children,
  className,
  recents = true,
}: {
  children: ReactNode
  className?: string
  /** Use recents grid column (default true for conversation rows). */
  recents?: boolean
}) {
  return (
    <div
      className={cn(
        recents ? SIDEBAR_RECENTS_ACTIONS_COLUMN_CLASS : SIDEBAR_ACTIONS_COLUMN_CLASS,
        className
      )}
    >
      {children}
    </div>
  )
}
