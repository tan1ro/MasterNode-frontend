import { API_BASE_URL } from "@/lib/routes"
import type { ChatMessage } from "@/types/api"

export interface PublicChatShare {
  share_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  expires_at?: string | null
}

/** Server-side fetch of a public share (no auth). Returns null when missing/expired. */
export async function fetchPublicChatShare(shareId: string): Promise<PublicChatShare | null> {
  const id = (shareId || "").trim()
  if (!id) return null
  try {
    const res = await fetch(`${API_BASE_URL}/v1/chat/shares/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return (await res.json()) as PublicChatShare
  } catch {
    return null
  }
}
