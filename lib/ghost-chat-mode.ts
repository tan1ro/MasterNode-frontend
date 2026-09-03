"use client"

const GHOST_MODE_PREF_KEY = "pref_chat_ghost_mode"

/** Conversation ids created in ghost mode during this tab session. */
const ghostConversationIds = new Set<string>()

export function isGhostChatModeEnabled(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(GHOST_MODE_PREF_KEY) === "1"
}

export function setGhostChatModeEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(GHOST_MODE_PREF_KEY, enabled ? "1" : "0")
}

export function registerGhostConversationId(conversationId: string): void {
  const id = conversationId.trim()
  if (!id) return
  ghostConversationIds.add(id)
}

export function isGhostConversationInSession(conversationId: string): boolean {
  return ghostConversationIds.has(conversationId.trim())
}

export function clearGhostConversationIds(): void {
  ghostConversationIds.clear()
}
