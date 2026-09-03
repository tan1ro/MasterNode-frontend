import type { ChatToolEvent, WebSearchSource } from "@/types/api"
import { extractWebSearchSources } from "@/lib/chat-web-search-sources"

export type WebSearchActivityStatus = "searching" | "done"

export interface WebSearchActivity {
  status: WebSearchActivityStatus
  query: string | null
  queries: string[]
  sources: WebSearchSource[]
  resultCount: number
}

export function primaryWebSearchQuery(activity: WebSearchActivity): string {
  const unique = new Set<string>()
  const ordered: string[] = []
  for (const candidate of [activity.query, ...activity.queries]) {
    const value = candidate?.trim()
    if (!value) continue
    const key = value.toLowerCase()
    if (unique.has(key)) continue
    unique.add(key)
    ordered.push(value)
  }
  if (ordered.length > 0) return ordered.join(" ")
  return "the web"
}

export function webSearchActivitySummary(activity: WebSearchActivity): string {
  if (activity.status === "searching") return "Searching the web"
  const count = activity.resultCount || activity.sources.length
  if (count > 0) return `Searched the web · ${count} result${count === 1 ? "" : "s"}`
  return "Searched the web"
}

export function parseWebSearchActivity(events?: ChatToolEvent[]): WebSearchActivity | null {
  if (!events?.length) return null

  const started = [...events]
    .reverse()
    .find((event) => event.name === "web_search" && event.type === "tool_call_started")
  const completed = [...events]
    .reverse()
    .find((event) => event.name === "web_search" && event.type === "tool_call_completed")
  const anchor = started ?? completed
  if (!anchor) return null

  const callId = anchor.call_id
  const matchedCompleted =
    completed && (!callId || !completed.call_id || completed.call_id === callId)
      ? completed
      : null

  const fromEvent = Array.isArray(anchor.queries)
    ? anchor.queries.map((q) => String(q).trim()).filter(Boolean)
    : []
  const primary = anchor.query?.trim() || null
  const queries = fromEvent.length > 0 ? fromEvent : primary ? [primary] : []
  const sources = matchedCompleted ? extractWebSearchSources(events) : []
  const resultCount =
    typeof matchedCompleted?.result_count === "number"
      ? matchedCompleted.result_count
      : sources.length

  return {
    status: matchedCompleted ? "done" : "searching",
    query: primary,
    queries,
    sources,
    resultCount,
  }
}
