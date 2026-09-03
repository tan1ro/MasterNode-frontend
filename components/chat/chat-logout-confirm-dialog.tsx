"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  SIDEBAR_DIALOG_BACKDROP_CLASS,
  SIDEBAR_DIALOG_SHELL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onConfirm: () => void
}

export function ChatLogoutConfirmDialog({
  open,
  onOpenChange,
  isPending = false,
  onConfirm,
}: Props) {
  const [mounted, setMounted] = useState(false)

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
        aria-labelledby="chat-logout-dialog-title"
        aria-describedby="chat-logout-dialog-description"
        className={SIDEBAR_DIALOG_SHELL_CLASS}
      >
        <h2 id="chat-logout-dialog-title" className="text-lg font-semibold text-foreground">
          Log out?
        </h2>
        <p
          id="chat-logout-dialog-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          Are you sure you want to log out?
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-w-[5.5rem] shadow-none"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Logging out…" : "Log out"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
