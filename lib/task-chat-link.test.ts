import { describe, expect, it } from "vitest"
import {
  parseTaskChatQueryParam,
  resolveTaskConversationId,
  taskDetailHref,
} from "@/lib/task-chat-link"

describe("task-chat-link", () => {
  it("builds task detail href with chat query param", () => {
    expect(taskDetailHref("api-123", "chat_abc")).toBe("/tasks/api-123?chat=chat_abc")
    expect(taskDetailHref("api-123")).toBe("/tasks/api-123")
  })

  it("parses chat query param", () => {
    expect(parseTaskChatQueryParam("?chat=chat_abc")).toBe("chat_abc")
    expect(parseTaskChatQueryParam("conversation_id=chat_def")).toBe("chat_def")
  })

  it("prefers task source_conversation_id over query param", () => {
    expect(
      resolveTaskConversationId({ source_conversation_id: "chat_task" }, "api-1", "chat_query")
    ).toBe("chat_task")
    expect(resolveTaskConversationId({}, "api-1", "chat_query")).toBe("chat_query")
  })
})
