"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { BookOpen, GitBranch, MoreHorizontal, Volume2 } from "lucide-react"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

export function MessageMoreMenu({
  timestamp,
  hasSources = false,
  disabled = false,
  onViewSources,
  onBranchInNewChat,
  onReadAloud,
}: {
  timestamp?: string
  hasSources?: boolean
  disabled?: boolean
  onViewSources?: () => void
  onBranchInNewChat?: () => void
  onReadAloud?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const items = [
    hasSources && onViewSources
      ? {
          key: "sources",
          label: "View sources",
          icon: BookOpen,
          onClick: () => {
            onViewSources()
            setOpen(false)
          },
        }
      : null,
    onBranchInNewChat
      ? {
          key: "branch",
          label: "Branch in new chat",
          icon: GitBranch,
          onClick: () => {
            onBranchInNewChat()
            setOpen(false)
          },
        }
      : null,
    onReadAloud
      ? {
          key: "read",
          label: "Read aloud",
          icon: Volume2,
          onClick: () => {
            onReadAloud()
            setOpen(false)
          },
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    icon: typeof BookOpen
    onClick: () => void
  }>

  if (items.length === 0) return null

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-muted/80 hover:text-foreground disabled:opacity-40",
          open && "bg-muted/80 text-foreground"
        )}
      >
        <MoreHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn("absolute bottom-full left-0 z-[80] mb-2 min-w-[12.5rem]", SIDEBAR_MENU_PANEL_CLASS)}
        >
          {timestamp ? (
            <p className="border-b border-border/40 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
              {timestamp}
            </p>
          ) : null}
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                className={cn(SIDEBAR_MENU_ITEM_CLASS, "gap-2.5")}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
