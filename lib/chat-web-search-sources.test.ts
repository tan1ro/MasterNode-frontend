import { describe, expect, it } from "vitest"
import { extractWebSearchSources, hostnameFromUrl } from "./chat-web-search-sources"
import type { ChatToolEvent } from "@/types/api"

describe("chat-web-search-sources", () => {
  it("extracts sources from completed web_search tool events", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_started",
        name: "web_search",
        call_id: "tool_1",
        query: "Nandeesh Kantli",
      },
      {
        type: "tool_call_completed",
        name: "web_search",
        call_id: "tool_1",
        status: "ok",
        sources: [
          {
            title: "Nandeesh Kantli | LinkedIn",
            url: "https://www.linkedin.com/in/nandeesh-kantli",
            source: "ddgs",
          },
        ],
      },
    ]
    expect(extractWebSearchSources(events)).toEqual([
      {
        title: "Nandeesh Kantli | LinkedIn",
        url: "https://www.linkedin.com/in/nandeesh-kantli",
        source: "ddgs",
      },
    ])
  })

  it("dedupes repeated urls", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_completed",
        name: "web_search",
        status: "ok",
        sources: [
          { title: "A", url: "https://example.com/a" },
          { title: "A duplicate", url: "https://example.com/a" },
        ],
      },
    ]
    expect(extractWebSearchSources(events)).toHaveLength(1)
  })

  it("parses hostnames from urls", () => {
    expect(hostnameFromUrl("https://www.linkedin.com/in/test")).toBe("linkedin.com")
  })
})
