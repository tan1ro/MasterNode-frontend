"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CHAT_ENABLED_MEMORY_CHANGED,
  isMemoryFileEnabled,
  loadChatEnabledMemoryKeys,
} from "@/lib/chat-enabled-memory"

export function useChatEnabledMemory() {
  const [enabledKeys, setEnabledKeys] = useState<string[]>([])

  const refresh = useCallback(() => {
    setEnabledKeys(loadChatEnabledMemoryKeys())
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window === "undefined") return
    window.addEventListener(CHAT_ENABLED_MEMORY_CHANGED, refresh)
    return () => window.removeEventListener(CHAT_ENABLED_MEMORY_CHANGED, refresh)
  }, [refresh])

  const isEnabled = useCallback(
    (sourceKey: string) => isMemoryFileEnabled(sourceKey, enabledKeys),
    [enabledKeys]
  )

  return { enabledKeys, enabledCount: enabledKeys.length, isEnabled, refresh }
}
