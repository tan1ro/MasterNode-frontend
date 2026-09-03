import { describe, expect, it } from "vitest"
import {
  fileGenerationActivitySummary,
  parseFileGenerationActivity,
} from "./chat-file-generation-activity"
import type { ChatToolEvent } from "@/types/api"

describe("chat-file-generation-activity", () => {
  it("parses presentation pipeline steps", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_started",
        name: "generate_presentation",
        call_id: "tool_abc",
      },
      {
        type: "tool_call_output",
        name: "generate_presentation",
        call_id: "tool_abc",
        step: "read",
        label: "Reading presentation style guide",
        detail: "ppt_generator.py",
      },
      {
        type: "tool_call_output",
        name: "generate_presentation",
        call_id: "tool_abc",
        step: "command",
        label: "Generate the PPTX",
      },
      {
        type: "tool_call_completed",
        name: "generate_presentation",
        call_id: "tool_abc",
        status: "ok",
        filename: "full-stack-development.pptx",
        slides_created: 10,
      },
    ]

    const activity = parseFileGenerationActivity(events)
    expect(activity).not.toBeNull()
    expect(activity?.status).toBe("done")
    expect(activity?.steps.length).toBeGreaterThanOrEqual(2)
    expect(fileGenerationActivitySummary(activity!)).toContain("created 1 file")
  })
})
