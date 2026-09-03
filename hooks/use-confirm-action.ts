"use client"

import { useCallback } from "react"

interface UseConfirmActionOptions<TId = string> {
  onConfirm: (id: TId) => void
  message: string | ((id: TId) => string)
}

/**
 * Wraps a destructive action behind a confirm() dialog.
 * Returns a stable callback that prompts before executing.
 */
export function useConfirmAction<TId = string>({
  onConfirm,
  message,
}: UseConfirmActionOptions<TId>) {
  return useCallback(
    (id: TId) => {
      const msg = typeof message === "function" ? message(id) : message
      if (confirm(msg)) {
        onConfirm(id)
      }
    },
    [onConfirm, message]
  )
}
