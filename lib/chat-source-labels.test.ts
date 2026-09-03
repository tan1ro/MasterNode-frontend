import { describe, expect, it } from "vitest"
import {
  citationPillLabel,
  groupSourcesBySite,
  siteLabelFromSource,
  siteLabelFromUrl,
} from "./chat-source-labels"
import type { WebSearchSource } from "@/types/api"

describe("chat-source-labels", () => {
  it("formats site labels from urls", () => {
    expect(siteLabelFromUrl("https://www.careers360.com/colleges")).toBe("Careers360")
    expect(siteLabelFromUrl("https://timesofindia.indiatimes.com/article")).toBe(
      "The Times of India"
    )
    expect(siteLabelFromUrl("https://www.linkedin.com/in/example")).toBe("LinkedIn")
    expect(siteLabelFromUrl("https://en.wikipedia.org/wiki/Foo")).toBe("Wikipedia")
  })

  it("ignores search provider ids and uses url hostname", () => {
    expect(
      siteLabelFromSource({
        title: "Profile",
        url: "https://www.linkedin.com/in/nandeesh",
        source: "ddgs",
      })
    ).toBe("LinkedIn")
    expect(
      siteLabelFromSource({
        title: "Article",
        url: "https://quora.com/q/123",
        source: "tavily",
      })
    ).toBe("Quora")
  })

  it("groups sources and formats citation pills", () => {
    const sources: WebSearchSource[] = [
      { title: "A", url: "https://www.careers360.com/a" },
      { title: "B", url: "https://www.careers360.com/b" },
      { title: "C", url: "https://example.com/c" },
    ]
    const groups = groupSourcesBySite(sources)
    expect(groups).toHaveLength(2)
    const careers = groups.find((g) => g.label === "Careers360")
    expect(careers).toBeTruthy()
    expect(citationPillLabel(careers!)).toBe("Careers360 +1")
  })
})
