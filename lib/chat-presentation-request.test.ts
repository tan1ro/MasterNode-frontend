import { describe, expect, it } from "vitest"
import { isPresentationRequest } from "./chat-presentation-request"

describe("isPresentationRequest", () => {
  it("detects ppt prompts", () => {
    expect(isPresentationRequest("create me a ppt on full stack development")).toBe(true)
    expect(isPresentationRequest("what is full stack development?")).toBe(false)
  })
})
