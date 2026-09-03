import type { ChatMessage, ChatToolEvent } from "@/types/api"

export interface ChatResponseVersion {
  content: string
  tool_events?: ChatToolEvent[]
}

function normalizeVersion(item: unknown): ChatResponseVersion | null {
  if (!item || typeof item !== "object") return null
  const content = String((item as ChatResponseVersion).content || "").trim()
  if (!content) return null
  const toolEvents = (item as ChatResponseVersion).tool_events
  return {
    content,
    tool_events: Array.isArray(toolEvents) ? toolEvents : undefined,
  }
}

export function getResponseVersions(message: ChatMessage): ChatResponseVersion[] {
  const raw = message.metadata?.response_versions
  if (Array.isArray(raw) && raw.length > 0) {
    const versions = raw.map(normalizeVersion).filter((v): v is ChatResponseVersion => Boolean(v))
    if (versions.length > 0) return versions
  }
  return [{ content: message.content, tool_events: message.tool_events }]
}

export function getActiveResponseIndex(message: ChatMessage): number {
  const versions = getResponseVersions(message)
  const raw = message.metadata?.active_response_index
  if (typeof raw === "number" && raw >= 0 && raw < versions.length) return raw
  return Math.max(versions.length - 1, 0)
}

export function getActiveResponseVersion(message: ChatMessage): ChatResponseVersion {
  const versions = getResponseVersions(message)
  const index = getActiveResponseIndex(message)
  return versions[index] ?? versions[versions.length - 1]
}

export function withActiveResponseIndex(message: ChatMessage, index: number): ChatMessage {
  const versions = getResponseVersions(message)
  const safeIndex = Math.max(0, Math.min(index, versions.length - 1))
  const active = versions[safeIndex]
  return {
    ...message,
    content: active.content,
    tool_events: active.tool_events ?? message.tool_events,
    metadata: {
      ...message.metadata,
      response_versions: versions,
      active_response_index: safeIndex,
    },
  }
}

export function appendResponseVersion(
  message: ChatMessage,
  content: string,
  toolEvents: ChatToolEvent[] = []
): ChatMessage {
  const versions = getResponseVersions(message)
  const trimmed = content.trim()
  if (!trimmed) return message

  const last = versions[versions.length - 1]
  if (last?.content.trim() === trimmed) {
    return {
      ...message,
      content: trimmed,
      tool_events: toolEvents.length > 0 ? toolEvents : message.tool_events,
      metadata: {
        ...message.metadata,
        response_versions: versions,
        active_response_index: versions.length - 1,
      },
    }
  }

  const nextVersions = [...versions, { content: trimmed, tool_events: toolEvents }]
  const nextIndex = nextVersions.length - 1
  return {
    ...message,
    content: trimmed,
    tool_events: toolEvents,
    metadata: {
      ...message.metadata,
      response_versions: nextVersions,
      active_response_index: nextIndex,
    },
  }
}

/** Apply a regenerated assistant reply, preserving prior versions for the pager. */
export function mergeRegeneratedAssistantMessage(
  previous: ChatMessage,
  doneMessage: ChatMessage
): ChatMessage {
  const backendVersions = doneMessage.metadata?.response_versions
  if (Array.isArray(backendVersions) && backendVersions.length > 1) {
    return {
      ...doneMessage,
      message_id: previous.message_id,
      conversation_id: previous.conversation_id || doneMessage.conversation_id,
    }
  }
  return appendResponseVersion(
    previous,
    doneMessage.content,
    doneMessage.tool_events ?? []
  )
}
