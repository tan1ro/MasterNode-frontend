import { describe, expect, it } from "vitest"
import {
  appendResponseVersion,
  getActiveResponseIndex,
  getResponseVersions,
  mergeRegeneratedAssistantMessage,
  withActiveResponseIndex,
} from "./chat-response-versions"
import type { ChatMessage } from "@/types/api"

const baseAssistant: ChatMessage = {
  message_id: "a1",
  conversation_id: "c1",
  role: "assistant",
  content: "First reply",
  created_at: "2026-01-01T00:00:00Z",
}

describe("chat-response-versions", () => {
  it("returns a single implicit version when metadata is absent", () => {
    expect(getResponseVersions(baseAssistant)).toEqual([
      { content: "First reply", tool_events: undefined },
    ])
    expect(getActiveResponseIndex(baseAssistant)).toBe(0)
  })

  it("appends a new response version and selects it", () => {
    const next = appendResponseVersion(baseAssistant, "Second reply")
    expect(getResponseVersions(next)).toHaveLength(2)
    expect(next.content).toBe("Second reply")
    expect(getActiveResponseIndex(next)).toBe(1)
  })

  it("merges a regenerated reply into version history", () => {
    const merged = mergeRegeneratedAssistantMessage(baseAssistant, {
      ...baseAssistant,
      content: "Second reply",
      tool_events: [],
    })
    expect(getResponseVersions(merged)).toHaveLength(2)
    expect(merged.content).toBe("Second reply")
    expect(getActiveResponseIndex(merged)).toBe(1)
  })

  it("prefers backend version metadata when present", () => {
    const merged = mergeRegeneratedAssistantMessage(baseAssistant, {
      ...baseAssistant,
      content: "Second reply",
      metadata: {
        response_versions: [{ content: "First reply" }, { content: "Second reply" }],
        active_response_index: 1,
      },
    })
    expect(getResponseVersions(merged)).toHaveLength(2)
    expect(merged.message_id).toBe("a1")
  })

  it("switches the active response index locally", () => {
    const withVersions: ChatMessage = {
      ...baseAssistant,
      metadata: {
        response_versions: [{ content: "First reply" }, { content: "Second reply" }],
        active_response_index: 1,
      },
      content: "Second reply",
    }
    const switched = withActiveResponseIndex(withVersions, 0)
    expect(switched.content).toBe("First reply")
    expect(getActiveResponseIndex(switched)).toBe(0)
  })
})
