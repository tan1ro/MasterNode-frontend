import type { ChatMessage, ChatToolEvent } from "@/types/api"
import { extractWebSearchSources } from "@/lib/chat-web-search-sources"

export function mergeToolEventsIntoMessage(
  message: ChatMessage,
  toolEvents: ChatToolEvent[]
): ChatMessage {
  if (!toolEvents.length) return message
  if (extractWebSearchSources(message.tool_events).length > 0) return message
  if (extractWebSearchSources(toolEvents).length === 0) return message
  return { ...message, tool_events: toolEvents }
}

export function mergeMessagesPreserveToolEvents(
  fetched: ChatMessage[],
  previous: ChatMessage[]
): ChatMessage[] {
  return fetched.map((message) => {
    const prior = previous.find((item) => item.message_id === message.message_id)
    if (!prior) return message
    return mergeToolEventsIntoMessage(message, prior.tool_events || [])
  })
}
