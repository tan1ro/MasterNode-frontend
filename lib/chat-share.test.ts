import { describe, expect, it } from "vitest"
import { formatChatTranscript } from "./chat-share"
import type { ChatMessage } from "@/types/api"

describe("chat-share", () => {
  it("formats a readable transcript", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "u1",
        conversation_id: "c1",
        role: "user",
        content: "Hello",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        message_id: "a1",
        conversation_id: "c1",
        role: "assistant",
        content: "Hi there",
        created_at: "2026-01-01T00:00:01Z",
      },
    ]
    expect(formatChatTranscript(messages)).toBe("You:\nHello\n\nAssistant:\nHi there")
  })

  it("includes attachment-only turns in the transcript", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "u1",
        conversation_id: "c1",
        role: "user",
        content: "",
        attachments: [{ attachment_id: "a1", conversation_id: "c1", filename: "image.png" }],
        created_at: "2026-01-01T00:00:00Z",
      },
    ]
    expect(formatChatTranscript(messages)).toBe("You:\n[Attached file: image.png]")
  })
})
