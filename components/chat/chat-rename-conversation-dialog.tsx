"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  SIDEBAR_DIALOG_BACKDROP_CLASS,
  SIDEBAR_DIALOG_SHELL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatTitle: string
  isPending?: boolean
  onConfirm: (title: string) => void
}

export function ChatRenameConversationDialog({
  open,
  onOpenChange,
  chatTitle,
  isPending = false,
  onConfirm,
}: Props) {
  const [value, setValue] = useState(chatTitle)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    setValue(chatTitle)
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [chatTitle, open])

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

  const trimmed = value.trim()
  const unchanged = trimmed === chatTitle.trim()
  const canSave = trimmed.length > 0 && !unchanged && !isPending

  const handleSubmit = () => {
    if (!canSave) return
    onConfirm(trimmed)
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-rename-dialog-title"
        className={SIDEBAR_DIALOG_SHELL_CLASS}
      >
        <h2 id="chat-rename-dialog-title" className="text-lg font-semibold text-foreground">
          Rename chat
        </h2>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <label htmlFor="chat-rename-input" className="sr-only">
            Chat name
          </label>
          <input
            ref={inputRef}
            id="chat-rename-input"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isPending}
            maxLength={200}
            placeholder="Chat name"
            className={cn(
              "w-full rounded-xl border border-border/70 bg-background px-3.5 py-2.5",
              "text-[15px] text-foreground outline-none transition-colors",
              "placeholder:text-muted-foreground focus:border-border focus:ring-2 focus:ring-ring/30",
              "disabled:opacity-60"
            )}
          />
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
              type="submit"
              disabled={!canSave}
              className={cn(
                "inline-flex h-10 min-w-[5.5rem] items-center justify-center rounded-md px-4",
                "bg-primary text-sm font-medium text-primary-foreground transition-colors shadow-none",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
