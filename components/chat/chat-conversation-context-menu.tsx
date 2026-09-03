"use client"

import { useEffect, useId, useRef, type RefObject } from "react"
import { createPortal } from "react-dom"
import {
  Archive,
  Pin,
  PinOff,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_ITEM_DESTRUCTIVE_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
  SIDEBAR_MENU_SEPARATOR_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

export interface ChatConversationMenuAnchor {
  top: number
  left: number
  right: number
  bottom: number
}

interface Props {
  open: boolean
  anchor: ChatConversationMenuAnchor | null
  triggerRef?: RefObject<HTMLElement | null>
  title: string
  pinned: boolean
  archived?: boolean
  onClose: () => void
  onShare: () => void
  onRename: () => void
  onTogglePin: () => void
  onArchive: () => void
  onDelete: () => void
  shareDisabled?: boolean
}

function menuPosition(anchor: ChatConversationMenuAnchor) {
  const width = 240
  let left = anchor.right + 6
  let top = Math.max(12, anchor.top - 6)

  if (left + width > window.innerWidth - 12) {
    left = Math.max(12, anchor.left - width - 6)
  }

  const maxHeight = 360
  if (top + maxHeight > window.innerHeight - 12) {
    top = Math.max(12, window.innerHeight - maxHeight - 12)
  }

  return { top, left, width }
}

function MenuItem({
  label,
  icon: Icon,
  onClick,
  destructive = false,
  disabled = false,
}: {
  label: string
  icon: typeof Share2
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        destructive ? SIDEBAR_MENU_ITEM_DESTRUCTIVE_CLASS : SIDEBAR_MENU_ITEM_CLASS,
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  )
}

export function ChatConversationContextMenu({
  open,
  anchor,
  triggerRef,
  title,
  pinned,
  archived = false,
  onClose,
  onShare,
  onRename,
  onTogglePin,
  onArchive,
  onDelete,
  shareDisabled = false,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (triggerRef?.current?.contains(target)) return
      onClose()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown)
    }, 0)

    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose, triggerRef])

  if (!open || !anchor || typeof document === "undefined") return null

  const { top, left, width } = menuPosition(anchor)

  return createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-label={`Actions for ${title}`}
      className={cn("fixed z-[200]", SIDEBAR_MENU_PANEL_CLASS)}
      style={{ top, left, width }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <MenuItem
        label="Share"
        icon={Share2}
        onClick={onShare}
        disabled={shareDisabled}
      />
      <MenuItem label="Rename" icon={Pencil} onClick={onRename} />
      <div className={SIDEBAR_MENU_SEPARATOR_CLASS} role="separator" />
      {!archived ? (
        <MenuItem
          label={pinned ? "Unpin chat" : "Pin chat"}
          icon={pinned ? PinOff : Pin}
          onClick={onTogglePin}
        />
      ) : null}
      <MenuItem label={archived ? "Restore" : "Archive"} icon={Archive} onClick={onArchive} />
      <MenuItem label="Delete" icon={Trash2} onClick={onDelete} destructive />
    </div>,
    document.body
  )
}
