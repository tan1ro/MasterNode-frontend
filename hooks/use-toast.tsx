"use client"

import { useCallback, useState } from "react"
import { Toast, type ToastVariant } from "@/components/shared/toast"

export interface ToastState {
  message: string
  variant: ToastVariant
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info",
      options?: { actionLabel?: string; onAction?: () => void; durationMs?: number }
    ) => {
      setToast({
        message,
        variant,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
        durationMs: options?.durationMs,
      })
    },
    []
  )

  const ToastSlot = () => (
    <Toast
      open={Boolean(toast)}
      message={toast?.message ?? ""}
      variant={toast?.variant ?? "info"}
      onClose={dismissToast}
      actionLabel={toast?.actionLabel}
      onAction={toast?.onAction}
      durationMs={toast?.durationMs}
    />
  )

  return { toast, showToast, dismissToast, ToastSlot }
}
