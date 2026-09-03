import { describe, expect, it } from "vitest"
import {
  isSourceUrl,
  mapOutsideMarkdownCode,
  replaceNumericCitationsWithMarkdownLinks,
} from "./chat-numbered-citations"
import type { WebSearchSource } from "@/types/api"

const sources: WebSearchSource[] = [
  {
    title: "IPL 2026 standings",
    url: "https://www.espncricinfo.com/standings",
    source: "espncricinfo.com",
  },
  {
    title: "RCB squad",
    url: "https://www.cricbuzz.com/rcb-squad",
    source: "cricbuzz.com",
  },
  {
    title: "RCB home ground",
    url: "https://www.iplt20.com/teams/rcb",
    source: "iplt20.com",
  },
]

describe("chat-numbered-citations", () => {
  it("replaces bracket citations with markdown links", () => {
    const out = replaceNumericCitationsWithMarkdownLinks(
      "RCB are top of the table [1] with a strong squad [2].",
      sources
    )
    expect(out).toContain("[ESPNcricinfo](https://www.espncricinfo.com/standings)")
    expect(out).toContain("[Cricbuzz](https://www.cricbuzz.com/rcb-squad)")
    expect(out).not.toContain("[1]")
  })

  it("replaces short multi-index citation groups when all indices are valid", () => {
    const out = replaceNumericCitationsWithMarkdownLinks("See sources [1, 2].", sources)
    expect(out).toContain("[ESPNcricinfo](https://www.espncricinfo.com/standings)")
    expect(out).toContain("[Cricbuzz](https://www.cricbuzz.com/rcb-squad)")
  })

  it("does not treat quicksort-style arrays as citations", () => {
    const code = "quicksort([1, 5, 2, 8, 3, 7, 6, 4])"
    expect(replaceNumericCitationsWithMarkdownLinks(code, sources)).toBe(code)
  })

  it("does not rewrite numeric arrays inside inline code", () => {
    const code = "Input: `[1, 2]` then continue"
    expect(replaceNumericCitationsWithMarkdownLinks(code, sources)).toBe(code)
  })

  it("does not rewrite when any index in the group is out of range", () => {
    const text = "Partial refs [1, 9] stay put"
    expect(replaceNumericCitationsWithMarkdownLinks(text, sources)).toBe(text)
  })

  it("replaces trailing numeric footnotes with markdown links", () => {
    const out = replaceNumericCitationsWithMarkdownLinks(
      "- Home venue: M. Chinnaswamy Stadium, Bangalore 3.",
      sources
    )
    expect(out).toContain("[IPL](https://www.iplt20.com/teams/rcb)")
    expect(out).not.toMatch(/Bangalore 3\./)
  })

  it("does not treat arrow results like → 9. as footnotes", () => {
    const text = "Pivot middle → 9."
    expect(replaceNumericCitationsWithMarkdownLinks(text, sources)).toBe(text)
  })

  it("leaves invalid citation indices unchanged", () => {
    const out = replaceNumericCitationsWithMarkdownLinks("Finished in position 15.", sources)
    expect(out).toBe("Finished in position 15.")
  })

  it("matches sources by normalized URL", () => {
    const match = isSourceUrl("https://www.espncricinfo.com/standings/", sources)
    expect(match?.url).toBe("https://www.espncricinfo.com/standings")
  })

  it("mapOutsideMarkdownCode leaves fenced blocks untouched", () => {
    const input = "Hello [1]\n```\n[1]\n```\nBye [2]"
    const out = mapOutsideMarkdownCode(input, (chunk) => chunk.replace("[1]", "ONE"))
    expect(out).toContain("Hello ONE")
    expect(out).toContain("```\n[1]\n```")
    expect(out).toContain("Bye [2]")
  })
})
