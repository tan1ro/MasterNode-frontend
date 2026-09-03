import { describe, expect, it } from "vitest"
import { extractPasteText, htmlToPlainText, insertTextAtSelection } from "./chat-input-paste"

describe("chat-input-paste", () => {
  it("converts html blocks to plain text with line breaks", () => {
    const html = "<p>Line one</p><p>Line two</p><blockquote>Quote</blockquote>"
    expect(htmlToPlainText(html)).toBe("Line one\nLine two\nQuote")
  })

  it("prefers plain text from clipboard", () => {
    const text = extractPasteText({
      getData: (type) => (type === "text/plain" ? "Hello\nWorld" : ""),
      types: ["text/plain"],
    })
    expect(text).toBe("Hello\nWorld")
  })

  it("inserts pasted text at the cursor", () => {
    const result = insertTextAtSelection("abc", "\nnew", 1, 1)
    expect(result.nextValue).toBe("a\nnewbc")
    expect(result.cursor).toBe(5)
  })
})
