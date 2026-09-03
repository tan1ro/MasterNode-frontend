import { describe, expect, it } from "vitest"
import {
  buildLiveThoughtModel,
  buildThoughtSummary,
  hasThoughtActivity,
  thoughtDurationLabel,
  thoughtElapsedFromEvents,
  thoughtSubjectLine,
} from "./chat-live-thought"
import type { ChatToolEvent } from "@/types/api"

describe("chat-live-thought", () => {
  it("builds a subject-aware summary", () => {
    expect(buildThoughtSummary("Tell me about Nandeesh Kantli")).toContain("Nandeesh Kantli")
    expect(thoughtSubjectLine("Who is Jane Doe?")).toBe("Jane Doe")
  })

  it("formats thought duration labels", () => {
    expect(thoughtDurationLabel(1, false)).toBe("Thought briefly")
    expect(thoughtDurationLabel(7, false)).toBe("Thought for 7s")
    expect(thoughtDurationLabel(3, true)).toBe("Thought for 3s")
  })

  it("tracks web search steps and read sources", () => {
    const events: ChatToolEvent[] = [
      { type: "tool_call_started", name: "web_search", call_id: "w1" },
      {
        type: "tool_call_output",
        name: "web_search",
        call_id: "w1",
        output: "Nandeesh Kantli profile",
      },
      {
        type: "tool_call_completed",
        name: "web_search",
        call_id: "w1",
        status: "ok",
        sources: [
          {
            title: "LinkedIn",
            url: "https://www.linkedin.com/in/example",
            snippet: "Profile",
          },
        ],
      },
    ]

    const model = buildLiveThoughtModel({
      userQuery: "Tell me about Nandeesh Kantli",
      toolEvents: events,
      hasResponseText: false,
      isStreaming: true,
    })

    expect(model.summary).toContain("Nandeesh Kantli")
    expect(model.exploringSummary).toContain("source")
    expect(model.steps.some((step) => step.verb.includes("Searched the web"))).toBe(true)
    expect(model.steps.some((step) => step.kind === "read" && step.verb === "Read")).toBe(true)
    expect(model.showThinkingSection).toBe(true)
    expect(model.webSearchActivity?.status).toBe("done")
  })

  it("detects thought-worthy tool activity", () => {
    expect(hasThoughtActivity([])).toBe(false)
    expect(
      hasThoughtActivity([{ type: "tool_call_started", name: "web_search" }])
    ).toBe(true)
    expect(
      hasThoughtActivity([
        { type: "tool_call_started", name: "chat_completion" },
        { type: "tool_call_completed", name: "chat_completion" },
      ])
    ).toBe(false)
  })

  it("derives elapsed seconds from tool event timestamps", () => {
    const elapsed = thoughtElapsedFromEvents([
      { type: "tool_call_started", name: "web_search", timestamp: "2026-01-01T00:00:00.000Z" },
      {
        type: "tool_call_completed",
        name: "web_search",
        timestamp: "2026-01-01T00:00:07.000Z",
      },
    ])
    expect(elapsed).toBe(7)
  })
})
