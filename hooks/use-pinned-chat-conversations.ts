"use client"

import { useCallback, useEffect, useState } from "react"
import {
  loadPinnedConversationIds,
  removePinnedConversationId,
  togglePinnedConversationId,
} from "@/lib/chat-pinned-conversations"

export function usePinnedChatConversations() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([])

  useEffect(() => {
    setPinnedIds(loadPinnedConversationIds())
  }, [])

  const togglePinned = useCallback((conversationId: string) => {
    const next = togglePinnedConversationId(conversationId)
    setPinnedIds(next)
    return next.includes(conversationId)
  }, [])

  const isPinned = useCallback(
    (conversationId: string) => pinnedIds.includes(conversationId),
    [pinnedIds]
  )

  const unpin = useCallback((conversationId: string) => {
    const next = removePinnedConversationId(conversationId)
    setPinnedIds(next)
  }, [])

  return { pinnedIds, togglePinned, isPinned, unpin }
}
