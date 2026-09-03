"use client"

import { clearGuestToken } from "@/lib/session-token-store"

/** Conversation ids created in this browser tab while logged out (not restored on refresh). */
const guestConversationIds = new Set<string>()

export function registerGuestConversationId(conversationId: string): void {
  const id = conversationId.trim()
  if (!id) return
  guestConversationIds.add(id)
}

export function isGuestConversationInSession(conversationId: string): boolean {
  return guestConversationIds.has(conversationId.trim())
}

export function clearGuestChatSession(): void {
  guestConversationIds.clear()
  clearGuestToken()
}
