import { describe, expect, it } from "vitest"
import {
  routeMessageIntent,
  shouldUseExplicitPipelineMode,
} from "./chat-intent-router"

describe("routeMessageIntent", () => {
  it("routes execution requests to pipeline", () => {
    expect(routeMessageIntent("I want to create a realtime fullstack html css js calculator page")).toBe("pipeline")
    expect(routeMessageIntent("Run the pipeline for this task")).toBe("pipeline")
    expect(routeMessageIntent("Build a market research report for our competitor landscape")).toBe("pipeline")
    expect(routeMessageIntent("Review this NDA contract for compliance risks")).toBe("pipeline")
    expect(routeMessageIntent("Plan sprint backlog and release for the API")).toBe("pipeline")
  })

  it("keeps research and status questions in conversation mode", () => {
    expect(routeMessageIntent("I want to know about world economic status")).toBe("conversation")
    expect(routeMessageIntent("Tell me about global warming")).toBe("conversation")
    expect(routeMessageIntent("What is the status of the US economy?")).toBe("conversation")
  })

  it("keeps short follow-ups in conversation mode", () => {
    expect(routeMessageIntent("is it done?")).toBe("conversation")
    expect(routeMessageIntent("status?")).toBe("conversation")
    expect(routeMessageIntent("what happened")).toBe("conversation")
  })

  it("routes attachment-processing requests to pipeline", () => {
    expect(routeMessageIntent("analyze these files and summarize", { hasPendingAttachments: true })).toBe("pipeline")
  })
})

describe("shouldUseExplicitPipelineMode", () => {
  it("uses pipeline for normal prompts when mode is on", () => {
    expect(shouldUseExplicitPipelineMode("Help me draft an essay outline")).toBe(true)
    expect(shouldUseExplicitPipelineMode("Tell me about global warming")).toBe(true)
  })

  it("keeps status follow-ups in chat", () => {
    expect(shouldUseExplicitPipelineMode("is it done?")).toBe(false)
    expect(shouldUseExplicitPipelineMode("status?")).toBe(false)
  })
})
