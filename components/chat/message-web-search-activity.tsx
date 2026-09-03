"use client"

import React, { useId, useState } from "react"
import { Check, ChevronDown, Globe, Loader2 } from "lucide-react"
import { SourceFavicon } from "@/components/chat/chat-source-favicon"
import { useChatSourcesPanelOptional } from "@/components/chat/chat-sources-panel"
import {
  primaryWebSearchQuery,
  webSearchActivitySummary,
  type WebSearchActivity,
} from "@/lib/chat-web-search-activity"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"
import type { WebSearchSource } from "@/types/api"
import { cn } from "@/lib/utils"

function SearchResultRow({
  source,
  onSelect,
}: {
  source: WebSearchSource
  onSelect: () => void
}) {
  const domain = hostnameFromUrl(source.url)
  const href = source.url?.trim() || undefined

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.preventDefault()
        onSelect()
        if (href) window.open(href, "_blank", "noopener,noreferrer")
      }}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/45"
      )}
    >
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border/40 bg-background">
        <SourceFavicon url={source.url} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground/95">{source.title}</span>
      {domain ? (
        <span className="max-w-[42%] shrink-0 truncate text-xs text-muted-foreground">
          {domain}
        </span>
      ) : null}
    </a>
  )
}

export function MessageWebSearchActivity({
  activity,
  messageId,
  defaultOpen,
  variant = "standalone",
  className,
}: {
  activity: WebSearchActivity
  messageId?: string
  defaultOpen?: boolean
  variant?: "standalone" | "embedded"
  className?: string
}) {
  const panelId = useId()
  const sourcesPanel = useChatSourcesPanelOptional()
  const [open, setOpen] = useState(
    defaultOpen ?? (activity.status === "searching" || activity.sources.length > 0)
  )

  const summary = webSearchActivitySummary(activity)
  const primaryQuery = primaryWebSearchQuery(activity)
  const searching = activity.status === "searching"

  const openSource = (focusSourceUrl?: string | null) => {
    if (activity.sources.length === 0) return
    sourcesPanel?.openSources(activity.sources, {
      messageId: messageId ?? null,
      focusSourceUrl: focusSourceUrl ?? null,
    })
  }

  const panel = open ? (
        <div
          id={panelId}
          className={cn(
            "relative",
            variant === "standalone" ? "mt-1 ml-1 border-l border-border/50 pl-4" : ""
          )}
        >
          <div className="relative py-1.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
                {searching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate">{primaryQuery}</span>
                  {activity.resultCount > 0 ? (
                    <span className="shrink-0 tabular-nums">
                      {activity.resultCount} result{activity.resultCount === 1 ? "" : "s"}
                    </span>
                  ) : searching ? (
                    <span className="shrink-0">Searching…</span>
                  ) : null}
                </div>

                {activity.sources.length > 0 ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                    <ul className="divide-y divide-border/40">
                      {activity.sources.map((source) => (
                        <li key={`${source.url}-${source.title}`}>
                          <SearchResultRow
                            source={source}
                            onSelect={() => openSource(source.url)}
                          />
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/40 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openSource(activity.sources[0]?.url ?? null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Open all sources
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {!searching ? (
            <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Done</span>
            </div>
          ) : null}
        </div>
      ) : null

  if (variant === "embedded") {
    return <div className={cn("min-w-0", className)}>{panel}</div>
  }

  return (
    <div className={cn("mb-3 min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-1",
          "text-sm text-muted-foreground hover:text-foreground transition-colors"
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {panel}
    </div>
  )
}
