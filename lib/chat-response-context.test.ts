import { describe, expect, it } from "vitest"
import {
  buildResponseContextItems,
  splitResponseContextItems,
} from "@/lib/chat-response-context"
import type { ChatToolEvent } from "@/types/api"

describe("buildResponseContextItems", () => {
  it("reads persisted response_context metadata", () => {
    const items = buildResponseContextItems(
      {
        response_context: {
          items: [
            { kind: "agent", template_id: "a1", label: "Research" },
            { kind: "memory", label: "notes.pdf", source: "uploads/notes.pdf" },
          ],
        },
      },
      undefined,
      undefined
    )
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.kind)).toEqual(["agent", "memory"])
    expect(items[0].label).toBe("Research")
    expect(items[1].label).toBe("notes.pdf")
  })

  it("falls back to legacy metadata and includes memory from knowledge_read", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_completed",
        name: "knowledge_read",
        sources: ["uploads/report.pdf"],
      },
      {
        type: "tool_call_completed",
        name: "keyword_memory",
        label: "Matched saved memory",
      },
      {
        type: "tool_call_completed",
        name: "web_search",
        status: "ok",
        query: "Melbourne weather",
      },
    ]
    const items = buildResponseContextItems(
      {
        agent_template_id: "coach",
        agent_template_name: "Career coach",
      },
      events,
      undefined
    )
    expect(items.map((item) => item.kind)).toEqual(["agent", "memory"])
    expect(items[0].label).toBe("Career Coach")
    expect(items[1].label).toBe("report.pdf")
  })

  it("replaces prompt-like agent labels with a short display name", () => {
    const items = buildResponseContextItems(
      {
        response_context: {
          items: [
            {
              kind: "agent",
              template_id: "custom-debug",
              label:
                "Analyze the failed unit test to identify the root cause of the failure and document the specific test cases.",
            },
          ],
        },
      },
      undefined,
      undefined
    )
    expect(items).toHaveLength(1)
    expect(items[0].label.length).toBeLessThan(40)
    expect(items[0].label.toLowerCase()).not.toContain("analyze the failed")
  })

  it("hides automatic keyword memory and web search chips", () => {
    const events: ChatToolEvent[] = [
      {
        type: "tool_call_completed",
        name: "keyword_memory",
        label: "Matched saved memory",
      },
      {
        type: "tool_call_completed",
        name: "web_search",
        status: "ok",
        query: "Melbourne weather",
      },
    ]
    const items = buildResponseContextItems(undefined, events, undefined)
    expect(items).toHaveLength(0)
  })

  it("hides prompt-like memory labels and only keeps Memory-page files", () => {
    const items = buildResponseContextItems(
      {
        response_context: {
          items: [
            {
              kind: "memory",
              label: "I want to know about world economic condition in 2026",
            },
            { kind: "memory", label: "PDF)." },
            { kind: "memory", label: "brief.pdf", source: "uploads/brief.pdf" },
            { kind: "agent", template_id: "a1", label: "Research" },
          ],
        },
      },
      undefined,
      undefined
    )
    expect(items.map((item) => item.kind)).toEqual(["memory", "agent"])
    expect(items[0].label).toBe("brief.pdf")
  })
})

describe("splitResponseContextItems", () => {
  it("keeps two inline and overflows the rest", () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      kind: "memory" as const,
      label: `file-${i}.pdf`,
    }))
    const split = splitResponseContextItems(items)
    expect(split.inline).toHaveLength(2)
    expect(split.overflow).toHaveLength(2)
  })
})
