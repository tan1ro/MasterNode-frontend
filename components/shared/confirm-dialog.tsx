"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  pendingLabel?: string
  variant?: "default" | "destructive"
  isPending?: boolean
  errorMessage?: string | null
  onConfirm: () => void
  /** Optional class for the dialog panel (e.g. max width). */
  contentClassName?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pendingLabel = "Please wait…",
  variant = "default",
  isPending = false,
  errorMessage,
  onConfirm,
  contentClassName,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, isPending, onOpenChange])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open || !mounted) return null

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={() => !isPending && onOpenChange(false)}
        aria-label="Dismiss"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg",
          contentClassName
        )}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold font-heading tracking-wide">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {errorMessage ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
