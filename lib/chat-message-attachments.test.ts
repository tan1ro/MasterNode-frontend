import { describe, expect, it } from "vitest"
import { hydrateChatMessageAttachments } from "@/lib/chat-message-attachments"
import type { ChatAttachment, ChatMessage } from "@/types/api"

describe("hydrateChatMessageAttachments", () => {
  it("merges stored attachment metadata into message refs", () => {
    const catalog: ChatAttachment[] = [
      {
        attachment_id: "att_1",
        conversation_id: "chat_1",
        filename: "Ankita Pai Jury.pdf",
        mime_type: "application/pdf",
        preview_available: true,
        text_available: true,
      },
    ]
    const messages: ChatMessage[] = [
      {
        message_id: "msg_1",
        conversation_id: "chat_1",
        role: "user",
        content: "Review this",
        created_at: "2026-07-05T00:00:00.000Z",
        attachments: [
          {
            attachment_id: "att_1",
            conversation_id: "",
            filename: "Ankita Pai Jury.pdf",
          },
        ],
      },
    ]

    const hydrated = hydrateChatMessageAttachments(messages, catalog, "chat_1")
    expect(hydrated[0].attachments?.[0].conversation_id).toBe("chat_1")
    expect(hydrated[0].attachments?.[0].preview_available).toBe(true)
  })
})
