import { describe, expect, it } from "vitest"

import { isResponseContinuationRequest } from "@/lib/chat-response-continuation"

describe("isResponseContinuationRequest", () => {
  it("detects short continuation phrases", () => {
    expect(isResponseContinuationRequest("continue")).toBe(true)
    expect(isResponseContinuationRequest("go on")).toBe(true)
    expect(isResponseContinuationRequest("next")).toBe(true)
    expect(isResponseContinuationRequest("more")).toBe(true)
    expect(isResponseContinuationRequest("keep going")).toBe(true)
    expect(isResponseContinuationRequest(".")).toBe(true)
    expect(isResponseContinuationRequest("Dig deeper")).toBe(true)
    expect(isResponseContinuationRequest("Tell me in detail")).toBe(true)
  })

  it("rejects substantive new prompts", () => {
    expect(isResponseContinuationRequest("continue the RFP for my client")).toBe(false)
    expect(isResponseContinuationRequest("On Global warming")).toBe(false)
  })
})
