import type { ChatToolEvent, WebSearchSource } from "@/types/api"

export function hostnameFromUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  try {
    return new URL(trimmed).hostname.replace(/^www\./i, "")
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0]?.replace(/^www\./i, "") || trimmed
  }
}

function dedupeSources(sources: WebSearchSource[]): WebSearchSource[] {
  const seen = new Set<string>()
  const out: WebSearchSource[] = []
  for (const source of sources) {
    const url = source.url?.trim()
    const title = source.title?.trim()
    if (!url && !title) continue
    const key = url || title
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      title: title || url,
      url: url || "",
      source: source.source,
      snippet: source.snippet?.trim() || undefined,
    })
  }
  return out
}

function isSuccessfulWebSearchCompletion(event: ChatToolEvent): boolean {
  if (event.name !== "web_search" || event.type !== "tool_call_completed") return false
  if (event.status === "error") return false
  return Array.isArray(event.sources) && event.sources.length > 0
}

export function extractWebSearchSources(events?: ChatToolEvent[]): WebSearchSource[] {
  if (!events?.length) return []
  const completed = [...events].reverse().find(isSuccessfulWebSearchCompletion)
  if (!completed?.sources) return []
  return dedupeSources(completed.sources)
}
