import { describe, expect, it } from "vitest"
import {
  detectQuoteLanguage,
  formatChatMessageWithQuote,
  parseQuotedChatMessage,
  quoteLooksLikeCode,
} from "@/lib/chat-quote"
import { languageLabelFromClassName } from "@/lib/chat-code-language"

describe("parseQuotedChatMessage", () => {
  it("splits quote and body from formatChatMessageWithQuote", () => {
    const stored = formatChatMessageWithQuote(
      "def quicksort(arr):\n    return arr",
      "explain line by line"
    )
    const parsed = parseQuotedChatMessage(stored)
    expect(parsed.quote).toContain("def quicksort")
    expect(parsed.body).toBe("explain line by line")
  })

  it("returns null quote when there is no blockquote", () => {
    const parsed = parseQuotedChatMessage("just a normal question")
    expect(parsed.quote).toBeNull()
    expect(parsed.body).toBe("just a normal question")
  })

  it("supports quote-only messages", () => {
    const stored = formatChatMessageWithQuote("hello world", "")
    const parsed = parseQuotedChatMessage(stored)
    expect(parsed.quote).toBe("hello world")
    expect(parsed.body).toBe("")
  })
})

describe("quoteLooksLikeCode / detectQuoteLanguage", () => {
  it("detects python snippets", () => {
    const code = "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr"
    expect(quoteLooksLikeCode(code)).toBe(true)
    expect(detectQuoteLanguage(code)).toBe("python")
  })
})

describe("languageLabelFromClassName", () => {
  it("maps language-python to Python", () => {
    expect(languageLabelFromClassName("language-python")).toBe("Python")
  })

  it("falls back to Code when missing", () => {
    expect(languageLabelFromClassName("")).toBe("Code")
  })
})
