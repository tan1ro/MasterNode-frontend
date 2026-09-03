import { trackProductEvent } from "@/lib/analytics/track-event"
import { ROUTES } from "@/lib/routes"
import { chatService } from "@/services/chat"
import type { ChatMessage } from "@/types/api"

export function buildChatShareUrl(shareId: string): string {
  const path = ROUTES.chatShare(shareId)
  if (typeof window === "undefined") return path
  return new URL(path, window.location.origin).toString()
}

/** @deprecated Private chat URLs are not shareable; use create + buildChatShareUrl. */
export function buildChatConversationUrl(conversationId: string): string {
  const path = ROUTES.chatConversation(conversationId)
  if (typeof window === "undefined") return path
  return new URL(path, window.location.origin).toString()
}

export function formatChatTranscript(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const who = m.role === "user" ? "You" : "Assistant"
      const text = m.content.trim()
      if (text) return `${who}:\n${text}`
      if (m.attachments && m.attachments.length > 0) {
        const names = m.attachments.map((item) => item.filename).filter(Boolean).join(", ")
        return `${who}:\n[Attached ${m.attachments.length === 1 ? "file" : "files"}${names ? `: ${names}` : ""}]`
      }
      return ""
    })
    .filter(Boolean)
    .join("\n\n")
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back to execCommand when clipboard API is blocked.
    }
  }
  if (typeof document === "undefined") {
    throw new Error("Clipboard is unavailable")
  }
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  document.body.removeChild(textarea)
  if (!copied) throw new Error("Clipboard copy failed")
}

export async function shareText(payload: {
  title?: string
  text: string
  url?: string
}): Promise<"shared" | "copied"> {
  const body = [payload.title, payload.text, payload.url].filter(Boolean).join("\n\n")
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      })
      return "shared"
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error
    }
  }
  await copyTextToClipboard(payload.url || body)
  return "copied"
}

export async function shareAssistantMessage(content: string): Promise<"shared" | "copied"> {
  return shareText({
    title: "Assistant reply",
    text: content.trim(),
  })
}

/**
 * Create a server-side share snapshot and open the native share sheet / copy
 * the public `/share/{shareId}` link.
 */
export async function shareChatConversation(
  messages: ChatMessage[],
  conversationId: string,
  title?: string
): Promise<"shared" | "copied"> {
  let created: Awaited<ReturnType<typeof chatService.createShare>>
  try {
    created = await chatService.createShare(conversationId)
  } catch (error) {
    const detail =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "detail" in error.response.data
        ? String((error.response.data as { detail?: unknown }).detail || "")
        : ""
    if (detail) throw new Error(detail)
    throw error
  }
  const url = buildChatShareUrl(created.share_id)
  const chatTitle = (title || created.title || "Shared chat").trim() || "Shared chat"
  const result = await shareText({
    title: chatTitle,
    text: `View this MasterNode chat: ${url}`,
    url,
  })
  void trackProductEvent(
    "share_chat",
    { share_id: created.share_id, message_count: messages.length },
    { conversationId }
  )
  return result
}
