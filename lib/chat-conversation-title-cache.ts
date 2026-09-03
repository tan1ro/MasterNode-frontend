import type { QueryClient } from "@tanstack/react-query"
import type { ChatConversation } from "@/types/api"

export function applyStreamConversationTitle(
  queryClient: QueryClient,
  conversationId: string,
  title: string | undefined
) {
  const nextTitle = (title || "").trim()
  if (!nextTitle) return
  queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (prev = []) =>
    prev.map((conversation) =>
      conversation.conversation_id === conversationId
        ? { ...conversation, title: nextTitle }
        : conversation
    )
  )
}
