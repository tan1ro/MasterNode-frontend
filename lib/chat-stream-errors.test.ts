import { describe, expect, it } from "vitest"
import { formatChatStreamError, isAssistantErrorMessage } from "./chat-stream-errors"

describe("chat-stream-errors", () => {
  it("maps rate limit errors to friendly copy", () => {
    const raw =
      'All chat streaming providers failed: litellm.RateLimitError: {"retry_after_seconds":15}'
    expect(formatChatStreamError(raw)).toContain("temporarily busy")
    expect(formatChatStreamError(raw)).not.toContain("litellm")
  })

  it("detects assistant error messages", () => {
    expect(isAssistantErrorMessage("The AI service is temporarily busy. Please wait.")).toBe(
      true
    )
    expect(isAssistantErrorMessage("I'm **MasterNode**")).toBe(false)
  })
})
