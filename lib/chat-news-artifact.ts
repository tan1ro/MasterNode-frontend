import type { ChatToolEvent } from "@/types/api"

export interface NewsHeadline {
  title: string
  url: string
  source?: string
  publisher?: string
  snippet?: string | null
  published_label?: string
}

export interface NewsArtifact {
  headlines: NewsHeadline[]
  query?: string
  provider?: string
}

function isNewsArtifact(value: unknown): value is NewsArtifact {
  if (!value || typeof value !== "object") return false
  const headlines = (value as NewsArtifact).headlines
  return Array.isArray(headlines) && headlines.length > 0
}

export function extractNewsArtifactFromToolEvents(events?: ChatToolEvent[]): NewsArtifact | null {
  if (!events?.length) return null
  const completed = [...events]
    .reverse()
    .find(
      (event) =>
        event.name === "web_search" &&
        event.type === "tool_call_completed" &&
        event.status !== "error" &&
        isNewsArtifact((event as { news_artifact?: unknown }).news_artifact)
    )
  if (!completed) return null
  return (completed as { news_artifact: NewsArtifact }).news_artifact
}

export function newsArtifactFromMetadata(metadata?: Record<string, unknown>): NewsArtifact | null {
  if (!metadata) return null
  const raw = metadata.news_artifact
  return isNewsArtifact(raw) ? raw : null
}
