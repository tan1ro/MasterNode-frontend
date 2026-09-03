"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "info"

export interface ToastProps {
  open: boolean
  message: string
  variant?: ToastVariant
  onClose?: () => void
  /** Auto-dismiss after this many ms; 0 disables auto-dismiss. */
  durationMs?: number
  actionLabel?: string
  onAction?: () => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-500/40 bg-card text-foreground",
  error: "border-destructive/50 bg-card text-foreground",
  info: "border-border bg-card text-foreground",
}

const icons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const iconColors: Record<ToastVariant, string> = {
  success: "text-emerald-500",
  error: "text-destructive",
  info: "text-muted-foreground",
}

export function Toast({
  open,
  message,
  variant = "info",
  onClose,
  durationMs = 4500,
  actionLabel,
  onAction,
}: ToastProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open || !durationMs || !onClose) return
    const t = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(t)
  }, [open, durationMs, onClose, message])

  if (!open || !mounted || !message) return null

  const Icon = icons[variant]

  const node = (
    <div
      className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-md w-full items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
          variantStyles[variant]
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColors[variant])} aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug pt-0.5">{message}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={() => {
                onAction()
                onClose?.()
              }}
              className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
