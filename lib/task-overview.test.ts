import { describe, expect, it } from "vitest"
import { buildChatTaskInsights, buildTaskSummaryReport } from "@/lib/task-overview"
import type { ChatMessage } from "@/types/api"

describe("task-overview", () => {
  it("extracts summary from nested final_result", () => {
    const report = buildTaskSummaryReport(
      { final_result: { summary: "Portfolio page generated with responsive layout." } },
      "Create a portfolio webpage"
    )
    expect(report?.summary).toContain("Portfolio page generated")
  })

  it("builds chat insights from task-linked messages", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "m1",
        conversation_id: "chat_1",
        role: "user",
        content: "Create a portfolio webpage",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        message_id: "m2",
        conversation_id: "chat_1",
        role: "assistant",
        content: "Agent pipeline started.",
        created_at: "2026-01-01T00:00:01Z",
        metadata: { task_id: "api-123" },
      },
    ]
    const insights = buildChatTaskInsights(messages, "api-123")
    expect(insights?.userPrompt).toBe("Create a portfolio webpage")
    expect(insights?.assistantNotes[0]).toContain("Agent pipeline started")
  })
})
