"use client"

import { useEffect, useId, useState, type ReactNode } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { SidebarNavLabel, SidebarRowIcon } from "@/components/chat/sidebar/chat-sidebar-row"
import {
  SIDEBAR_ICON_CLASS,
  SIDEBAR_ICON_SLOT_CLASS,
  SIDEBAR_NAV_CONTROL_CLASS,
  SIDEBAR_NAV_ROW_CLASS,
  SIDEBAR_TEXT_CLASS,
  sidebarRowStateClass,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

/** Collapsible sidebar section (Workspace / Team / Account / Admin). */
export function ChatSidebarNavSection({
  label,
  icon,
  defaultOpen = true,
  active = false,
  children,
}: {
  label: string
  icon: LucideIcon
  defaultOpen?: boolean
  /** Keep open when a child route is active. */
  active?: boolean
  children: ReactNode
}) {
  const panelId = useId()
  const [open, setOpen] = useState(() => defaultOpen || active)

  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          SIDEBAR_NAV_ROW_CLASS,
          SIDEBAR_NAV_CONTROL_CLASS,
          SIDEBAR_TEXT_CLASS,
          sidebarRowStateClass(active && open),
          "grid-cols-[1.125rem_minmax(0,1fr)_1.125rem] cursor-pointer"
        )}
      >
        <SidebarRowIcon icon={icon} active={active && open} />
        <SidebarNavLabel>{label}</SidebarNavLabel>
        <span className={SIDEBAR_ICON_SLOT_CLASS}>
          <ChevronRight
            className={cn(
              SIDEBAR_ICON_CLASS,
              "text-foreground/60 transition-transform duration-200",
              open && "rotate-90"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        </span>
      </button>
      {open ? (
        <div id={panelId} role="group" aria-label={label} className="flex flex-col gap-0.5">
          {children}
        </div>
      ) : null}
    </div>
  )
}
