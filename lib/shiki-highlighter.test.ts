import { describe, expect, it } from "vitest"
import {
  badgeLabelForCodeBlock,
  bundledLanguageCount,
  highlightCodeWithShiki,
  isShikiBundledLanguage,
  languageFromFence,
  shikiThemeForColorScheme,
} from "@/lib/shiki-highlighter"

describe("languageFromFence", () => {
  it("reads the fence tag from react-markdown class names", () => {
    expect(languageFromFence("language-python")).toBe("python")
    expect(languageFromFence("language-java")).toBe("java")
    expect(languageFromFence("language-c++")).toBe("c++")
    expect(languageFromFence("hljs language-typescript")).toBe("typescript")
  })

  it("returns null when no fence language is present", () => {
    expect(languageFromFence(undefined)).toBeNull()
    expect(languageFromFence("font-mono")).toBeNull()
  })
})

describe("badgeLabelForCodeBlock", () => {
  it("prefers filename over language", () => {
    expect(badgeLabelForCodeBlock("python", "main.py")).toBe("main.py")
  })

  it("uses proper language labels, including acronyms", () => {
    expect(badgeLabelForCodeBlock("python")).toBe("Python")
    expect(badgeLabelForCodeBlock("html")).toBe("HTML")
    expect(badgeLabelForCodeBlock("css")).toBe("CSS")
    expect(badgeLabelForCodeBlock("json")).toBe("JSON")
    expect(badgeLabelForCodeBlock(null)).toBe("Code")
  })
})

describe("shikiThemeForColorScheme", () => {
  it("maps app color scheme to MasterNode Shiki themes", () => {
    expect(shikiThemeForColorScheme("dark")).toBe("masternode-dark")
    expect(shikiThemeForColorScheme("light")).toBe("masternode-light")
  })
})

describe("bundled languages", () => {
  it("exposes 100+ Shiki grammars without custom aliases", () => {
    expect(bundledLanguageCount()).toBeGreaterThan(100)
    expect(isShikiBundledLanguage("python")).toBe(true)
    expect(isShikiBundledLanguage("java")).toBe(true)
    expect(isShikiBundledLanguage("not-a-real-language")).toBe(false)
  })
})

describe("highlightCodeWithShiki", () => {
  it("passes the fence language directly to Shiki", async () => {
    const html = await highlightCodeWithShiki("def foo():\n  return 1", "python")
    expect(html).toContain("shiki")
    expect(html).toContain("masternode-dark")
  })

  it("uses Shiki plain text when no fence language is given", async () => {
    const html = await highlightCodeWithShiki("hello world", null)
    expect(html).toContain("shiki")
    expect(html).toContain("hello world")
  })

  it("uses masternode-light tokens in light mode", async () => {
    const html = await highlightCodeWithShiki("const x = 1", "javascript", "light")
    expect(html).toContain("masternode-light")
  })

  it("colors Java using the java fence tag only", async () => {
    const code = `public class MergeSort {
  public static void sort(int[] arr) {}
}`
    const html = await highlightCodeWithShiki(code, "java")
    expect(html).toContain("masternode-dark")
  })

  it("returns one pre/code tree without modifying token markup", async () => {
    const html = await highlightCodeWithShiki("x = 1", "python")
    expect(html).toMatch(/^<pre class="shiki[^"]*"/)
    expect(html).toContain("<code>")
    expect(html).not.toContain("<div")
  })

  it("uses distinct MasterNode Dark colors for HTML tags, attributes, and strings", async () => {
    const html = await highlightCodeWithShiki(
      `<div class="hero" data-x="ok">Hi</div>`,
      "html"
    )
    expect(html.toLowerCase()).toContain("#f07178")
    expect(html.toLowerCase()).toContain("#7dd3fc")
    expect(html.toLowerCase()).toContain("#a8d96c")
  })

  it("uses distinct MasterNode Dark colors for CSS selectors, properties, and values", async () => {
    const html = await highlightCodeWithShiki(
      `body { background: #ffffff; color: var(--text); padding: 20px; }`,
      "css"
    )
    const lower = html.toLowerCase()
    expect(lower).toContain("#82aaff")
    expect(lower).toContain("#7dd3fc")
    expect(lower.includes("#e5c07b") || lower.includes("#f2a65a")).toBe(true)
  })

  it("uses distinct MasterNode Dark colors for JS keywords, strings, and functions", async () => {
    const html = await highlightCodeWithShiki(
      `const hello = "value";\nfunction foo() { return true; }`,
      "javascript"
    )
    const lower = html.toLowerCase()
    expect(lower).toContain("#c792ea")
    expect(lower).toContain("#a8d96c")
    expect(lower.includes("#f2a65a") || lower.includes("#f07178")).toBe(true)
  })

  it("uses distinct MasterNode Dark colors for JSON keys, strings, and booleans", async () => {
    const html = await highlightCodeWithShiki(
      `{ "name": "MasterNode", "version": 1, "enabled": true }`,
      "json"
    )
    const lower = html.toLowerCase()
    expect(lower).toContain("#82aaff")
    expect(lower).toContain("#a8d96c")
    expect(lower.includes("#f07178") || lower.includes("#e5c07b")).toBe(true)
  })

  it("uses MasterNode Dark purple for Markdown headings", async () => {
    const html = await highlightCodeWithShiki("# Main heading\n\nBody text", "markdown")
    expect(html.toLowerCase()).toContain("#c792ea")
  })

  it("uses MasterNode Dark purple and green for Python keywords and strings", async () => {
    const html = await highlightCodeWithShiki(
      `def greet(name):\n    return f"hello {name}"`,
      "python"
    )
    const lower = html.toLowerCase()
    expect(lower).toContain("#c792ea")
    expect(lower).toContain("#a8d96c")
  })
})
