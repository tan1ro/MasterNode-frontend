import { ROUTES } from "@/lib/routes"

export const CHAT_PRICING_SEGMENT = "pricing"

/** Sidebar / shortcut "New chat" — ChatWorkspace clears pending id + UI even if already on `/chat`. */
export const CHAT_BEGIN_DRAFT_EVENT = "masternode-chat-begin-draft"

export function requestBeginDraftChat(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(CHAT_BEGIN_DRAFT_EVENT))
}

/** @deprecated Use `ROUTES.chatPricing` — pricing lives in the chat upgrade page. */
export const HOME_PRICING_HREF = ROUTES.chatPricing

/** Draft chat pricing route (`/chat/pricing`). */
export const CHAT_PRICING_PATH = `${ROUTES.chat}/${CHAT_PRICING_SEGMENT}` as const

/** Pricing route scoped to an open conversation (`/chat/:id/pricing`). */
export function chatConversationPricingPath(chatId: string): string {
  return `${ROUTES.chat}/${encodeURIComponent(chatId)}/${CHAT_PRICING_SEGMENT}`
}

/** Signed-in pricing deep link — preserves conversation when one is open. */
export function plansPricingHref(chatId?: string | null): string {
  const id = chatId?.trim()
  if (id) return chatConversationPricingPath(id)
  return CHAT_PRICING_PATH
}

export function isChatPricingRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (pathname === CHAT_PRICING_PATH) return true
  const prefix = `${ROUTES.chat}/`
  if (!pathname.startsWith(prefix)) return false
  return pathname.endsWith(`/${CHAT_PRICING_SEGMENT}`)
}

/** Conversation id from `/chat/:id`, or `null` on draft `/chat` and pricing routes. */
export function parseChatConversationIdFromPathname(pathname: string): string | null {
  if (!pathname || pathname === ROUTES.chat || pathname === CHAT_PRICING_PATH) return null
  const prefix = `${ROUTES.chat}/`
  if (!pathname.startsWith(prefix)) return null
  const parts = pathname.slice(prefix.length).split("/").filter(Boolean)
  if (parts.length === 0) return null
  const head = parts[0]
  if (!head || head === "dashboard" || head === CHAT_PRICING_SEGMENT) return null
  let conversationId = head
  try {
    conversationId = decodeURIComponent(head)
  } catch {
    conversationId = head
  }
  if (parts.length >= 2 && parts[1] === CHAT_PRICING_SEGMENT) return conversationId
  if (parts.length === 1) return conversationId
  return null
}
