import type { ChatToolEvent } from "@/types/api"
import { extractWebSearchSources } from "@/lib/chat-web-search-sources"

export interface WebSearchStreamState {
  /** A web_search tool call is in progress or just finished (pre-token). */
  visible: boolean
  /** Primary search query. */
  query: string | null
  /** Expanded queries shown in the status line (ChatGPT-style). */
  queries: string[]
  sources: ReturnType<typeof extractWebSearchSources>
}

export function formatWebSearchStatusLine(queries: string[]): string {
  const cleaned = queries.map((q) => q.trim()).filter(Boolean)
  if (cleaned.length === 0) return "Searching the web"
  return `Searching for ${cleaned.join(" ")}…`
}

export function getWebSearchStreamState(events: ChatToolEvent[]): WebSearchStreamState {
  const started = [...events]
    .reverse()
    .find((event) => event.name === "web_search" && event.type === "tool_call_started")
  if (!started) {
    return { visible: false, query: null, queries: [], sources: [] }
  }

  const callId = started.call_id
  const completed = events.some(
    (event) =>
      event.name === "web_search" &&
      event.type === "tool_call_completed" &&
      (!callId || event.call_id === callId)
  )

  const fromEvent = Array.isArray(started.queries)
    ? started.queries.map((q) => String(q).trim()).filter(Boolean)
    : []
  const primary = started.query?.trim() || null
  const queries =
    fromEvent.length > 0 ? fromEvent : primary ? [primary] : []

  return {
    visible: true,
    query: primary,
    queries,
    sources: completed ? extractWebSearchSources(events) : [],
  }
}
