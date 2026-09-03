"use client"

import { useCallback, useRef, useState, type MouseEvent } from "react"
import { MoreHorizontal, Pin } from "lucide-react"
import { ChatConversationContextMenu, type ChatConversationMenuAnchor } from "@/components/chat/chat-conversation-context-menu"
import { ChatDeleteConversationDialog } from "@/components/chat/chat-delete-conversation-dialog"
import { ChatRenameConversationDialog } from "@/components/chat/chat-rename-conversation-dialog"
import { SidebarRowActions } from "@/components/chat/sidebar/chat-sidebar-row"
import {
  SIDEBAR_ICON_CLASS,
  SIDEBAR_RECENTS_LABEL_CLASS,
  SIDEBAR_TEXT_CLASS,
  sidebarRecentsItemClass,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { shareChatConversation } from "@/lib/chat-share"
import { chatService } from "@/services/chat"
import type { ChatConversation } from "@/types/api"
import { cn } from "@/lib/utils"

interface Props {
  conversation: ChatConversation
  active: boolean
  pinned: boolean
  shareDisabled?: boolean
  onSelect: () => void
  onTogglePin: () => boolean
  onRename: (title: string) => Promise<void>
  onArchive: () => Promise<void>
  onDelete: () => Promise<void>
  onNotice?: (message: string, variant?: "success" | "error" | "info") => void
}

const ACTION_BTN_CLASS =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-muted/50 hover:text-foreground"

export function ChatConversationSidebarRow({
  conversation,
  active,
  pinned,
  shareDisabled = false,
  onSelect,
  onTogglePin,
  onRename,
  onArchive,
  onDelete,
  onNotice,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<ChatConversationMenuAnchor | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renamePending, setRenamePending] = useState(false)
  const [sharePending, setSharePending] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  const title = conversation.title || "New chat"
  const showActions = pinned || active || menuOpen

  const openMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    setMenuAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    })
    setMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleShare = useCallback(async () => {
    if (sharePending || shareDisabled) return
    closeMenu()
    setSharePending(true)
    try {
      const { messages } = await chatService.getConversation(conversation.conversation_id)
      if (messages.length === 0) {
        onNotice?.("Nothing to share — send a message first.", "error")
        return
      }
      const result = await shareChatConversation(messages, conversation.conversation_id, title)
      onNotice?.(
        result === "shared" ? "Share link ready." : "Share link copied.",
        "success"
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not share this chat."
      onNotice?.(message, "error")
    } finally {
      setSharePending(false)
    }
  }, [closeMenu, conversation.conversation_id, onNotice, shareDisabled, sharePending, title])

  const handleRename = useCallback(() => {
    closeMenu()
    setRenameOpen(true)
  }, [closeMenu])

  const handleRenameConfirm = useCallback(
    async (nextTitle: string) => {
      setRenamePending(true)
      try {
        await onRename(nextTitle)
        setRenameOpen(false)
        onNotice?.("Chat renamed.", "success")
      } catch {
        onNotice?.("Could not rename this chat.", "error")
      } finally {
        setRenamePending(false)
      }
    },
    [onNotice, onRename]
  )

  const handleTogglePin = useCallback(() => {
    closeMenu()
    const nowPinned = onTogglePin()
    onNotice?.(nowPinned ? "Chat pinned." : "Chat unpinned.", "success")
  }, [closeMenu, onNotice, onTogglePin])

  const handleArchive = useCallback(() => {
    closeMenu()
    const restoring = Boolean(conversation.archived)
    void onArchive()
      .then(() =>
        onNotice?.(restoring ? "Chat restored." : "Chat archived.", "success")
      )
      .catch(() =>
        onNotice?.(
          restoring ? "Could not restore this chat." : "Could not archive this chat.",
          "error"
        )
      )
  }, [closeMenu, conversation.archived, onArchive, onNotice])

  const handleDeleteRequest = useCallback(() => {
    closeMenu()
    setDeleteOpen(true)
  }, [closeMenu])

  const handleDeleteConfirm = useCallback(async () => {
    setDeletePending(true)
    try {
      await onDelete()
      setDeleteOpen(false)
      onNotice?.("Chat deleted.", "success")
    } catch {
      onNotice?.("Could not delete this chat.", "error")
    } finally {
      setDeletePending(false)
    }
  }, [onDelete, onNotice])

  return (
    <>
      <div className={cn("group", sidebarRecentsItemClass(active || menuOpen))}>
        <button
          type="button"
          onClick={onSelect}
          title={pinned ? `${title} (pinned)` : title}
          className={cn(
            SIDEBAR_RECENTS_LABEL_CLASS,
            SIDEBAR_TEXT_CLASS,
            "flex min-w-0 items-center gap-1.5",
            active || menuOpen ? "text-foreground" : "text-inherit"
          )}
        >
          {pinned ? (
            <Pin
              className="h-3.5 w-3.5 shrink-0 text-foreground/45"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : null}
          <span className="min-w-0 truncate">{title}</span>
        </button>

        <SidebarRowActions
          className={
            showActions
              ? undefined
              : "max-lg:flex lg:hidden lg:group-hover:flex lg:group-focus-within:flex"
          }
        >
          <div ref={actionsRef} className="flex items-center">
            <button
              type="button"
              aria-label="Chat options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onMouseDown={(event) => event.preventDefault()}
              onClick={openMenu}
              className={cn(ACTION_BTN_CLASS, menuOpen && "bg-muted/50 text-foreground")}
            >
              <MoreHorizontal className={SIDEBAR_ICON_CLASS} aria-hidden />
            </button>
          </div>
        </SidebarRowActions>
      </div>

      <ChatConversationContextMenu
        open={menuOpen}
        anchor={menuAnchor}
        triggerRef={actionsRef}
        title={title}
        pinned={pinned}
        archived={conversation.archived}
        onClose={closeMenu}
        onShare={() => void handleShare()}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
        onArchive={handleArchive}
        onDelete={handleDeleteRequest}
        shareDisabled={shareDisabled}
      />

      <ChatRenameConversationDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        chatTitle={title}
        isPending={renamePending}
        onConfirm={(nextTitle) => void handleRenameConfirm(nextTitle)}
      />

      <ChatDeleteConversationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        chatTitle={title}
        isPending={deletePending}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  )
}
