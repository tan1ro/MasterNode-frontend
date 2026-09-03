import { describe, expect, it } from "vitest"
import {
  parseWebSearchActivity,
  primaryWebSearchQuery,
  webSearchActivitySummary,
} from "./chat-web-search-activity"
import type { ChatToolEvent } from "@/types/api"

describe("chat-web-search-activity", () => {
  it("parses searching and completed web search events", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_started",
        name: "web_search",
        call_id: "tool_1",
        query: "top colleges in Karnataka",
        queries: ["top colleges in Karnataka", "NIRF Karnataka engineering colleges"],
      },
      {
        type: "tool_call_completed",
        name: "web_search",
        call_id: "tool_1",
        status: "ok",
        result_count: 2,
        sources: [
          {
            title: "Top Colleges",
            url: "https://www.careers360.com/colleges",
            snippet: "Rankings overview.",
          },
        ],
      },
    ]

    const searching = parseWebSearchActivity([events[0]])
    expect(searching?.status).toBe("searching")
    expect(primaryWebSearchQuery(searching!)).toBe(
      "top colleges in Karnataka NIRF Karnataka engineering colleges"
    )

    const done = parseWebSearchActivity(events)
    expect(done?.status).toBe("done")
    expect(webSearchActivitySummary(done!)).toBe("Searched the web · 2 results")
    expect(done?.sources).toHaveLength(1)
  })
})
