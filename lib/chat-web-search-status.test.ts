import { describe, expect, it } from "vitest"
import {
  formatWebSearchStatusLine,
  getWebSearchStreamState,
} from "./chat-web-search-status"
import type { ChatToolEvent } from "@/types/api"

describe("chat-web-search-status", () => {
  it("formats a joined query line", () => {
    expect(
      formatWebSearchStatusLine([
        "top colleges in Karnataka",
        "NIRF Karnataka engineering colleges",
        "medical colleges Karnataka",
      ])
    ).toBe(
      "Searching for top colleges in Karnataka NIRF Karnataka engineering colleges medical colleges Karnataka…"
    )
  })

  it("falls back to generic label", () => {
    expect(formatWebSearchStatusLine([])).toBe("Searching the web")
  })

  it("reads queries from started tool events", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_started",
        name: "web_search",
        call_id: "tool_1",
        query: "top colleges in Karnataka",
        queries: [
          "top colleges in Karnataka",
          "NIRF Karnataka engineering colleges",
        ],
      },
    ]
    const state = getWebSearchStreamState(events)
    expect(state.visible).toBe(true)
    expect(state.queries).toEqual([
      "top colleges in Karnataka",
      "NIRF Karnataka engineering colleges",
    ])
  })
})
