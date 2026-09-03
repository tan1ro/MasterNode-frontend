import type { ChatConversation } from "@/types/api"

const STORAGE_KEY = "chat-pinned-conversations"

export function loadPinnedConversationIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
  } catch {
    return []
  }
}

export function savePinnedConversationIds(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore quota errors
  }
}

export function togglePinnedConversationId(conversationId: string): string[] {
  const current = loadPinnedConversationIds()
  const next = current.includes(conversationId)
    ? current.filter((id) => id !== conversationId)
    : [conversationId, ...current]
  savePinnedConversationIds(next)
  return next
}

export function removePinnedConversationId(conversationId: string): string[] {
  const next = loadPinnedConversationIds().filter((id) => id !== conversationId)
  savePinnedConversationIds(next)
  return next
}

export function sortConversationsWithPins(
  conversations: ChatConversation[],
  pinnedIds: string[]
): ChatConversation[] {
  if (!pinnedIds.length) return conversations
  const byId = new Map(conversations.map((c) => [c.conversation_id, c]))
  const pinned = pinnedIds.map((id) => byId.get(id)).filter(Boolean) as ChatConversation[]
  const pinnedSet = new Set(pinnedIds)
  const rest = conversations.filter((c) => !pinnedSet.has(c.conversation_id))
  return [...pinned, ...rest]
}
