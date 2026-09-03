import { describe, expect, it } from "vitest"
import {
  mergeMessagesPreserveToolEvents,
  mergeToolEventsIntoMessage,
} from "./chat-message-tool-events"
import type { ChatMessage, ChatToolEvent } from "@/types/api"

const streamEvents: ChatToolEvent[] = [
  {
    type: "tool_call_completed",
    name: "web_search",
    status: "ok",
    sources: [{ title: "Example", url: "https://example.com" }],
  },
]

describe("chat-message-tool-events", () => {
  it("merges stream tool events when persisted message lacks sources", () => {
    const message: ChatMessage = {
      message_id: "a1",
      conversation_id: "c1",
      role: "assistant",
      content: "Answer",
      created_at: "2026-01-01T00:00:00Z",
      tool_events: [],
    }
    const merged = mergeToolEventsIntoMessage(message, streamEvents)
    expect(merged.tool_events).toEqual(streamEvents)
  })

  it("preserves prior tool events after conversation refresh", () => {
    const previous: ChatMessage[] = [
      {
        message_id: "a1",
        conversation_id: "c1",
        role: "assistant",
        content: "Answer",
        created_at: "2026-01-01T00:00:00Z",
        tool_events: streamEvents,
      },
    ]
    const fetched: ChatMessage[] = [
      {
        message_id: "a1",
        conversation_id: "c1",
        role: "assistant",
        content: "Answer",
        created_at: "2026-01-01T00:00:00Z",
        tool_events: [],
      },
    ]
    const merged = mergeMessagesPreserveToolEvents(fetched, previous)
    expect(merged[0].tool_events).toEqual(streamEvents)
  })
})
