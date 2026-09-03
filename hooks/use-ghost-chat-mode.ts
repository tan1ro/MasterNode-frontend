"use client"

import { useCallback, useEffect, useState } from "react"
import {
  isGhostChatModeEnabled,
  setGhostChatModeEnabled,
} from "@/lib/ghost-chat-mode"

export function useGhostChatMode() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(isGhostChatModeEnabled())
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      setGhostChatModeEnabled(next)
      return next
    })
  }, [])

  const setGhostMode = useCallback((next: boolean) => {
    setGhostChatModeEnabled(next)
    setEnabled(next)
  }, [])

  return { ghostModeEnabled: enabled, toggleGhostMode: toggle, setGhostModeEnabled: setGhostMode }
}
