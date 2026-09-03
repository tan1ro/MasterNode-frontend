"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { chatService, type StreamChatBody } from "@/services/chat"
import { applyStreamConversationTitle } from "@/lib/chat-conversation-title-cache"
import { BILLING_SUBSCRIPTION_KEY } from "@/hooks/use-billing"
import type { ChatMessage, ChatToolEvent } from "@/types/api"

export function useChatStream() {
  const queryClient = useQueryClient()
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [streamError, setStreamError] = useState<string | null>(null)
  const [toolEvents, setToolEvents] = useState<ChatToolEvent[]>([])

  const runStream = useCallback(
    async (
      conversationId: string,
      body: StreamChatBody,
      onDone?: (msg: ChatMessage) => void
    ) => {
      setStreaming(true)
      setStreamText("")
      setStreamError(null)
      setToolEvents([])
      await chatService.streamReply(conversationId, body, {
        onToken: (delta) => setStreamText((prev) => prev + delta),
        onDone: (payload) => {
          // Clear transient streaming text once final assistant message is committed.
          setStreamText("")
          void queryClient.invalidateQueries({ queryKey: BILLING_SUBSCRIPTION_KEY })
          applyStreamConversationTitle(queryClient, conversationId, payload?.conversation_title)
          if (payload?.message) onDone?.(payload.message)
        },
        onError: (message) => setStreamError(message),
        onToolEvent: (event) => setToolEvents((prev) => [...prev, event]),
      })
      setStreaming(false)
    },
    [queryClient]
  )

  return {
    streaming,
    streamText,
    streamError,
    toolEvents,
    runStream,
    resetStream: () => {
      setStreamText("")
      setStreamError(null)
      setToolEvents([])
    },
  }
}
