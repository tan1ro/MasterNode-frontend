import type { ChatToolEvent } from "@/types/api"
import { siteLabelFromSource } from "@/lib/chat-source-labels"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"
import {
  parseWebSearchActivity,
  type WebSearchActivity,
} from "@/lib/chat-web-search-activity"

export type ThoughtStepStatus = "running" | "done"

export interface ThoughtStep {
  id: string
  kind: "search" | "read" | "status"
  verb: string
  detail?: string
  status: ThoughtStepStatus
}

export interface LiveThoughtModel {
  summary: string
  exploringSummary: string
  exploringNarrative: string
  thinkingNarrative: string
  showThinkingSection: boolean
  steps: ThoughtStep[]
  footer: string
  webSearchActivity: WebSearchActivity | null
}

function extractSubject(userQuery: string): string {
  const text = userQuery.trim()
  const tell = text.match(
    /\b(?:tell me about|who is|who're|who's|what do you know about)\s+(.+?)[?.!]*$/i
  )
  if (tell?.[1]) return tell[1].trim()
  const about = text.match(/\babout\s+(.+?)[?.!]*$/i)
  if (about?.[1]) return about[1].trim()
  return text.replace(/[?.!]+$/, "").trim()
}

export function buildThoughtSummary(userQuery: string): string {
  const subject = extractSubject(userQuery)
  if (!subject) {
    return "Working through your question and gathering the best available context."
  }
  return `Reviewing sources and building an answer about ${subject}.`
}

export function thoughtDurationLabel(elapsedSeconds: number, isStreaming: boolean): string {
  if (isStreaming) return `Thought for ${Math.max(elapsedSeconds, 1)}s`
  if (elapsedSeconds <= 2) return "Thought briefly"
  return `Thought for ${Math.max(elapsedSeconds, 1)}s`
}

export function thoughtElapsedFromEvents(events?: ChatToolEvent[]): number | null {
  if (!events?.length) return null
  const stamps = events
    .map((event) => event.timestamp)
    .filter((value): value is string => Boolean(value?.trim()))
    .sort()
  if (stamps.length < 2) return null
  const start = Date.parse(stamps[0]!)
  const end = Date.parse(stamps[stamps.length - 1]!)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null
  return Math.max(1, Math.round((end - start) / 1000))
}

function webSearchProgressQueries(events: ChatToolEvent[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const event of events) {
    if (event.name !== "web_search" || event.type !== "tool_call_output") continue
    const q = String(event.output || "").trim()
    if (!q || seen.has(q.toLowerCase())) continue
    seen.add(q.toLowerCase())
    out.push(q)
  }
  return out
}

function chatCompletionRunning(events: ChatToolEvent[]): boolean {
  const started = events.some(
    (event) => event.name === "chat_completion" && event.type === "tool_call_started"
  )
  const completed = events.some(
    (event) => event.name === "chat_completion" && event.type === "tool_call_completed"
  )
  return started && !completed
}

function readDetailForSource(url: string, sourceLabel: string): string {
  const host = hostnameFromUrl(url)
  return host || sourceLabel
}

function buildExploringSummary(options: {
  queries: string[]
  webSearchActivity: WebSearchActivity | null
  isStreaming: boolean
}): string {
  const { queries, webSearchActivity, isStreaming } = options
  const searchCount = Math.max(queries.length, webSearchActivity?.queries.length || 0, 1)
  const sourceCount =
    webSearchActivity?.resultCount || webSearchActivity?.sources.length || 0

  if (webSearchActivity?.status === "searching") {
    return `Searching the web · ${searchCount} ${searchCount === 1 ? "query" : "queries"}`
  }
  if (sourceCount > 0) {
    return `Explored ${sourceCount} ${sourceCount === 1 ? "source" : "sources"} · ${searchCount} ${searchCount === 1 ? "search" : "searches"}`
  }
  return isStreaming ? "Exploring…" : "Explored the web"
}

function buildExploringNarrative(
  subject: string,
  webSearchActivity: WebSearchActivity | null,
  isStreaming: boolean
): string {
  if (webSearchActivity?.status === "searching") {
    return subject
      ? `Looking up live pages and profiles to ground an answer about ${subject}.`
      : "Looking up live web results before drafting a reply."
  }
  if (webSearchActivity?.sources.length) {
    return subject
      ? `Reviewing top matches and pulling facts that answer your question about ${subject}.`
      : "Reviewing top matches from the web before drafting the reply."
  }
  if (isStreaming) {
    return "Checking what context is needed before searching or drafting."
  }
  return "Gathering context for the reply."
}

function buildThinkingNarrative(
  subject: string,
  hasResponseText: boolean,
  isStreaming: boolean
): string {
  if (hasResponseText && isStreaming) {
    return subject
      ? `Synthesizing the sources into a clear answer about ${subject}, with citations where possible.`
      : "Synthesizing the sources into a clear, well-structured reply."
  }
  if (hasResponseText) {
    return subject
      ? `Finalized an answer about ${subject} using the explored sources.`
      : "Finalized the reply using the explored sources."
  }
  return subject
    ? `Planning how to structure an answer about ${subject} from the search results.`
    : "Planning how to structure the reply from the search results."
}

export function buildLiveThoughtModel(options: {
  userQuery: string
  toolEvents: ChatToolEvent[]
  hasResponseText: boolean
  isStreaming: boolean
}): LiveThoughtModel {
  const { userQuery, toolEvents, hasResponseText, isStreaming } = options
  const subject = extractSubject(userQuery)
  const webSearchActivity = parseWebSearchActivity(toolEvents)
  const steps: ThoughtStep[] = []
  const progressQueries = webSearchProgressQueries(toolEvents)

  const queries =
    progressQueries.length > 0
      ? progressQueries
      : webSearchActivity?.queries.length
        ? webSearchActivity.queries
        : webSearchActivity?.query
          ? [webSearchActivity.query]
          : []

  const searching = webSearchActivity?.status === "searching"

  for (const event of toolEvents) {
    if (event.name === "domain_analysis" && event.type === "tool_call_completed") {
      steps.push({
        id: `think-${event.call_id || event.label || "domain"}`,
        kind: "status",
        verb: "Super thinking",
        detail: String(
          event.label || (event as { framework?: string }).framework || ""
        ).replace(/^Super thinking ·\s*/i, ""),
        status: "done",
      })
    }
    if (event.name === "world_time" && event.type === "tool_call_completed") {
      steps.push({
        id: `time-${event.call_id || "world"}`,
        kind: "status",
        verb: "World time",
        detail: String(event.label || "Local time lookup"),
        status: "done",
      })
    }
    if (event.name === "weather" && event.type === "tool_call_completed") {
      steps.push({
        id: `wx-${event.call_id || "weather"}`,
        kind: "status",
        verb: "Weather",
        detail: String(event.label || "Forecast"),
        status: "done",
      })
    }
    if (event.name === "calculator" && event.type === "tool_call_completed") {
      steps.push({
        id: `calc-${event.call_id || "calc"}`,
        kind: "status",
        verb: "Calculator",
        detail: String(event.label || "Computed"),
        status: "done",
      })
    }
    if (event.name === "finance_quote" && event.type === "tool_call_completed") {
      steps.push({
        id: `fin-${event.call_id || "finance"}`,
        kind: "status",
        verb: "Live quote",
        detail: String(event.label || "Market data"),
        status: "done",
      })
    }
    if (event.name === "places" && event.type === "tool_call_completed") {
      steps.push({
        id: `place-${event.call_id || "places"}`,
        kind: "status",
        verb: "Map",
        detail: String(event.label || "Place lookup"),
        status: "done",
      })
    }
    if (event.name === "vision" && event.type === "tool_call_completed") {
      steps.push({
        id: `vision-${event.call_id || "vision"}`,
        kind: "status",
        verb: "Vision",
        detail: String(event.label || "Image analysis"),
        status: "done",
      })
    }
    if (event.name === "knowledge_read" && event.type === "tool_call_completed") {
      const sources = Array.isArray(event.sources) ? event.sources : []
      const preview = sources.slice(0, 4)
      for (const source of preview) {
        steps.push({
          id: `kb-${String(source)}`,
          kind: "read",
          verb: "Deep-read",
          detail: String(source),
          status: "done",
        })
      }
      if (sources.length > preview.length) {
        steps.push({
          id: "kb-more",
          kind: "read",
          verb: "Deep-read",
          detail: `${sources.length - preview.length} more knowledge snippet(s)`,
          status: "done",
        })
      } else if (!preview.length && event.label) {
        steps.push({
          id: `kb-${event.call_id || "generic"}`,
          kind: "read",
          verb: "Deep-read",
          detail: String(event.label),
          status: "done",
        })
      }
    }
  }

  const headlinesSearch = toolEvents.some(
    (event) =>
      event.name === "web_search" &&
      event.type === "tool_call_started" &&
      String(event.label || "").toLowerCase().includes("headline")
  )
  const searchVerb = headlinesSearch ? "Searching headlines" : "Searching the web"
  const searchedVerb = headlinesSearch ? "Searched headlines" : "Searched the web"

  if (webSearchActivity || progressQueries.length > 0) {
    for (const query of queries) {
      steps.push({
        id: `search-${query}`,
        kind: "search",
        verb: searching
          ? headlinesSearch
            ? "Searching headlines for"
            : "Searching the web for"
          : headlinesSearch
            ? "Searched headlines for"
            : "Searched the web for",
        detail: query,
        status: searching ? "running" : "done",
      })
    }

    if (queries.length === 0) {
      steps.push({
        id: "search-generic",
        kind: "search",
        verb: searching ? searchVerb : searchedVerb,
        status: searching ? "running" : "done",
      })
    }

    if (webSearchActivity?.sources.length) {
      const preview = webSearchActivity.sources.slice(0, 6)
      for (const source of preview) {
        const label = siteLabelFromSource(source)
        steps.push({
          id: `read-${source.url}`,
          kind: "read",
          verb: "Read",
          detail: readDetailForSource(source.url, label),
          status: "done",
        })
      }
      const remaining = webSearchActivity.sources.length - preview.length
      if (remaining > 0) {
        steps.push({
          id: "read-more",
          kind: "read",
          verb: "Read",
          detail: `${remaining} more ${remaining === 1 ? "source" : "sources"}`,
          status: "done",
        })
      }
    }
  }

  let footer = "Planning next moves"
  if (hasResponseText) {
    footer = isStreaming ? "Drafting response" : "Done"
  } else if (chatCompletionRunning(toolEvents)) {
    footer = "Planning next moves"
  } else if (webSearchActivity?.status === "searching") {
    footer = headlinesSearch ? "Searching headlines" : "Searching the web"
  } else if (webSearchActivity?.status === "done" && !hasResponseText && isStreaming) {
    footer = "Planning next moves"
  }

  if (!isStreaming && !hasResponseText && steps.length === 0) {
    footer = "Done"
  }

  const showThinkingSection =
    isStreaming ||
    hasResponseText ||
    chatCompletionRunning(toolEvents) ||
    webSearchActivity?.status === "done"

  return {
    summary: buildThoughtSummary(userQuery),
    exploringSummary: buildExploringSummary({ queries, webSearchActivity, isStreaming }),
    exploringNarrative: buildExploringNarrative(subject, webSearchActivity, isStreaming),
    thinkingNarrative: buildThinkingNarrative(subject, hasResponseText, isStreaming),
    showThinkingSection,
    steps,
    footer,
    webSearchActivity,
  }
}

export function thoughtSubjectLine(userQuery: string): string {
  const subject = extractSubject(userQuery)
  return subject || userQuery.trim()
}

export function hasThoughtActivity(toolEvents?: ChatToolEvent[]): boolean {
  if (!toolEvents?.length) return false
  if (toolEvents.some((event) => event.name === "web_search")) return true
  if (toolEvents.some((event) => event.name === "domain_analysis")) return true
  if (toolEvents.some((event) => event.name === "knowledge_read")) return true
  if (toolEvents.some((event) => event.name === "world_time")) return true
  if (toolEvents.some((event) => event.name === "weather")) return true
  return chatCompletionRunning(toolEvents)
}
