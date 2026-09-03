import { describe, expect, it } from "vitest"
import { getAssistantFollowUpSuggestions } from "./chat-follow-up-suggestions"

describe("getAssistantFollowUpSuggestions", () => {
  it("returns empty when web search was not used", () => {
    expect(getAssistantFollowUpSuggestions("hello", "world", false)).toEqual([])
  })

  it("includes tell me in detail for web-grounded replies", () => {
    const suggestions = getAssistantFollowUpSuggestions(
      "best restaurants RR Nagar",
      "Here are a few picks.",
      true
    )
    expect(suggestions[0]).toBe("Tell me in detail")
    expect(suggestions).toContain("Dig deeper")
    expect(suggestions).toContain("Which one do you recommend?")
  })

  it("uses fitness follow-ups instead of restaurant compare for workout plans", () => {
    const suggestions = getAssistantFollowUpSuggestions(
      "I am 5'6 78kg male",
      "Here is your workout plan with Day 1 Upper Body and macros.",
      true
    )
    expect(suggestions).toContain("Export as DOCX")
    expect(suggestions).not.toContain("Compare the top options")
    expect(suggestions).not.toContain("Which one do you recommend?")
  })

  it("offers docx when assistant mentioned export", () => {
    const suggestions = getAssistantFollowUpSuggestions(
      "plan",
      "Full fitness blueprint. Need a PDF/DOCX version of this plan?",
      true
    )
    expect(suggestions).toContain("Yes, as DOCX")
  })
})
