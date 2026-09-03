"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  SIDEBAR_DIALOG_BACKDROP_CLASS,
  SIDEBAR_DIALOG_SHELL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { useAppShellOptional } from "@/components/layout/app-shell-context"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatTitle: string
  isPending?: boolean
  onConfirm: () => void
}

export function ChatDeleteConversationDialog({
  open,
  onOpenChange,
  chatTitle,
  isPending = false,
  onConfirm,
}: Props) {
  const shell = useAppShellOptional()
  const [mounted, setMounted] = useState(false)
  const displayTitle = chatTitle.trim() || "New chat"

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, isPending, onOpenChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !mounted) return null

  const openSettings = () => {
    onOpenChange(false)
    shell?.openSettings()
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <button
        type="button"
        className={SIDEBAR_DIALOG_BACKDROP_CLASS}
        onClick={() => !isPending && onOpenChange(false)}
        aria-label="Dismiss"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="chat-delete-dialog-title"
        aria-describedby="chat-delete-dialog-description"
        className={SIDEBAR_DIALOG_SHELL_CLASS}
      >
        <h2 id="chat-delete-dialog-title" className="text-lg font-semibold text-foreground">
          Delete chat?
        </h2>
        <p id="chat-delete-dialog-description" className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          This will delete <span className="font-semibold text-foreground">{displayTitle}</span>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Visit{" "}
          {shell ? (
            <button
              type="button"
              onClick={openSettings}
              className="underline underline-offset-2 hover:text-foreground"
            >
              settings
            </button>
          ) : (
            <span className="underline underline-offset-2">settings</span>
          )}{" "}
          to delete any memories saved during this chat.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4",
              "text-sm font-medium text-foreground transition-colors shadow-none",
              "hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "inline-flex h-10 min-w-[5.5rem] items-center justify-center rounded-md px-4",
              "bg-destructive text-sm font-medium text-destructive-foreground transition-colors shadow-none",
              "hover:bg-destructive/90 disabled:opacity-50"
            )}
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
