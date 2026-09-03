import { describe, expect, it } from "vitest"
import { filterAndSortConversations } from "./chat-conversation-search"
import type { ChatConversation } from "@/types/api"

function conv(
  id: string,
  title: string,
  updated_at: string,
  preview?: string
): ChatConversation {
  return {
    conversation_id: id,
    title,
    archived: false,
    created_at: updated_at,
    updated_at,
    last_message_preview: preview ?? null,
  }
}

describe("filterAndSortConversations", () => {
  const list = [
    conv("a", "Alpha chat", "2026-06-04T10:00:00"),
    conv("b", "Beta notes", "2026-06-03T10:00:00", "law in india"),
    conv("c", "Gamma", "2026-06-02T10:00:00"),
  ]

  it("filters by title and preview", () => {
    const out = filterAndSortConversations(list, {
      query: "law",
      sortKey: "newest",
      dateFilter: "all",
    })
    expect(out.map((c) => c.conversation_id)).toEqual(["b"])
  })

  it("sorts by title ascending", () => {
    const out = filterAndSortConversations(list, {
      sortKey: "title_asc",
      dateFilter: "all",
    })
    expect(out.map((c) => c.title)).toEqual(["Alpha chat", "Beta notes", "Gamma"])
  })

  it("sorts newest first by updated_at", () => {
    const out = filterAndSortConversations(list, {
      sortKey: "newest",
      dateFilter: "all",
    })
    expect(out.map((c) => c.conversation_id)).toEqual(["a", "b", "c"])
  })
})
