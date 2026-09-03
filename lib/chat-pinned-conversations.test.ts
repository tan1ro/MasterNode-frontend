import { describe, expect, it } from "vitest"
import type { ChatConversation } from "@/types/api"
import { sortConversationsWithPins } from "./chat-pinned-conversations"

function conv(id: string, title: string): ChatConversation {
  return {
    conversation_id: id,
    title,
    archived: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  }
}

describe("sortConversationsWithPins", () => {
  it("keeps pinned chats at the top in pin order", () => {
    const list = [conv("a", "A"), conv("b", "B"), conv("c", "C")]
    expect(sortConversationsWithPins(list, ["c", "a"]).map((c) => c.conversation_id)).toEqual([
      "c",
      "a",
      "b",
    ])
  })
})
