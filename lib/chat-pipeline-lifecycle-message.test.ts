import { describe, expect, it } from "vitest"
import {
  isLegacyPipelineStatusMessage,
  isPipelineLifecycleMessage,
  shouldHidePipelineStatusMessage,
} from "./chat-pipeline-lifecycle-message"
import type { ChatMessage } from "@/types/api"

describe("chat-pipeline-lifecycle-message", () => {
  it("detects merged lifecycle message", () => {
    const msg = {
      message_id: "m1",
      role: "assistant",
      content: "Review plan",
      metadata: { pipeline_lifecycle: true, task_id: "api-1" },
    } as ChatMessage
    expect(isPipelineLifecycleMessage(msg)).toBe(true)
  })

  it("hides legacy pipeline bubbles when lifecycle message exists", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "old1",
        role: "assistant",
        content: "Analyzing your request...",
        metadata: { task_id: "api-1", pipeline_stage: "request_analysis" },
      },
      {
        message_id: "life1",
        role: "assistant",
        content: "Review plan",
        metadata: { pipeline_lifecycle: true, task_id: "api-1" },
      },
    ]
    expect(shouldHidePipelineStatusMessage(messages[0], messages)).toBe(true)
    expect(shouldHidePipelineStatusMessage(messages[1], messages)).toBe(false)
  })

  it("hides duplicate legacy messages keeping the latest", () => {
    const messages: ChatMessage[] = [
      {
        message_id: "a",
        role: "assistant",
        content: "Here's your **Proposed Plan**.",
        metadata: { task_id: "api-2", pipeline_plan_review: true },
      },
      {
        message_id: "b",
        role: "assistant",
        content: "**PIPELINE MODE ACTIVATED**",
        metadata: { task_id: "api-2", pipeline_activated: true },
      },
    ]
    expect(shouldHidePipelineStatusMessage(messages[0], messages)).toBe(true)
    expect(shouldHidePipelineStatusMessage(messages[1], messages)).toBe(false)
  })
})
