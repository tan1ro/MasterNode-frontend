import { describe, expect, it } from "vitest"
import {
  conversationHasPipelineCompletion,
  latestPipelineCompletionMessageId,
  pipelineTasksWithDeliverables,
} from "./chat-pipeline-messages"

describe("chat-pipeline-messages", () => {
  it("detects existing completion for a task", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "Pipeline completed. Final validated output is ready.",
        metadata: { task_id: "task-1" },
      },
    ]
    expect(conversationHasPipelineCompletion(messages, "task-1")).toBe(true)
    expect(conversationHasPipelineCompletion(messages, "task-2")).toBe(false)
  })

  it("detects presentation pipeline completion messages", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "Slides look sharp and clean. Let me share the file.",
        metadata: {
          task_id: "task-ppt",
          presentation_artifact: { filename: "deck.pptx", mime_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", base64: "UEs=" },
        },
      },
    ]
    expect(conversationHasPipelineCompletion(messages, "task-ppt")).toBe(true)
  })

  it("detects document pipeline completion messages", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "Your document is ready. Review the sections below.",
        metadata: {
          task_id: "task-doc",
          document_markdown: "# Case Study\n\n## Problem",
        },
      },
    ]
    expect(conversationHasPipelineCompletion(messages, "task-doc")).toBe(true)
  })

  it("detects document markdown deliverables without completion copy", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "Here is the analysis.",
        metadata: {
          task_id: "task-doc-2",
          document_markdown: "# Global Inflation\n\n## Overview",
        },
      },
    ]
    expect(conversationHasPipelineCompletion(messages, "task-doc-2")).toBe(true)
  })

  it("lists task ids that already have deliverables", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "draft",
        metadata: {
          task_id: "task-a",
          document_markdown: "# Ready",
        },
      },
      {
        message_id: "m2",
        role: "assistant" as const,
        content: "still planning",
        metadata: { task_id: "task-b", pipeline_plan_review: true },
      },
    ]
    const ids = pipelineTasksWithDeliverables(messages)
    expect(ids.has("task-a")).toBe(true)
    expect(ids.has("task-b")).toBe(false)
  })

  it("keeps only the latest completion message id per task", () => {
    const messages = [
      {
        message_id: "m1",
        role: "assistant" as const,
        content: "Pipeline completed. Final validated output is ready.",
        metadata: { task_id: "task-1" },
      },
      {
        message_id: "m2",
        role: "assistant" as const,
        content: "Pipeline completed. Final validated output is ready.",
        metadata: { task_id: "task-1" },
      },
    ]
    expect(latestPipelineCompletionMessageId(messages).get("task-1")).toBe("m2")
  })
})
