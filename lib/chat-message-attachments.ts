import type { ChatAttachment, ChatMessage } from "@/types/api"

/** Merge conversation attachment catalog into per-message refs. */
export function hydrateChatMessageAttachments(
  messages: ChatMessage[],
  catalog: ChatAttachment[],
  conversationId?: string | null
): ChatMessage[] {
  if (!messages.length) return messages
  const byId = new Map(catalog.map((item) => [item.attachment_id, item]))
  const fallbackConversationId = (conversationId || "").trim()

  return messages.map((message) => {
    const refs = message.attachments
    if (!refs?.length) return message

    return {
      ...message,
      attachments: refs.map((ref) => {
        const stored = byId.get(ref.attachment_id)
        const resolvedConversationId =
          stored?.conversation_id ||
          ref.conversation_id ||
          message.conversation_id ||
          fallbackConversationId

        return stored
          ? {
              ...stored,
              ...ref,
              conversation_id: resolvedConversationId,
              filename: ref.filename || stored.filename,
              mime_type: ref.mime_type || stored.mime_type,
              size_bytes: ref.size_bytes ?? stored.size_bytes,
            }
          : {
              ...ref,
              conversation_id: resolvedConversationId,
            }
      }),
    }
  })
}
