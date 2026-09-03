"use client"

import { useState, useCallback, useRef } from "react"

interface UseClipboardOptions {
  resetDelay?: number
}

export function useClipboard({ resetDelay = 2000 }: UseClipboardOptions = {}) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text)
      setCopiedValue(text)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopiedValue(null), resetDelay)
    },
    [resetDelay]
  )

  const hasCopied = useCallback(
    (value: string) => copiedValue === value,
    [copiedValue]
  )

  return { copy, copiedValue, hasCopied, isCopied: copiedValue !== null }
}
