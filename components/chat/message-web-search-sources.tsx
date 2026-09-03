"use client"

import React, { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { WebSearchSource } from "@/types/api"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"
import { SourceFavicon, SourceFaviconStack } from "@/components/chat/chat-source-favicon"
import { cn } from "@/lib/utils"

export function MessageWebSearchSources({
  sources,
  className,
}: {
  sources: WebSearchSource[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (sources.length === 0) return null

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground",
          "hover:bg-muted/80 hover:text-foreground transition-colors"
        )}
      >
        <SourceFaviconStack sources={sources} />
        <span>Sources</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-2 overflow-hidden rounded-xl border border-border/50 bg-background/90"
        >
          <ul className="divide-y divide-border/40">
            {sources.map((source) => {
              const domain = hostnameFromUrl(source.url)
              const content = (
                <>
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border/40 bg-muted/40">
                    <SourceFavicon url={source.url} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{source.title}</span>
                    {domain ? (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {domain}
                      </span>
                    ) : null}
                  </span>
                </>
              )

              return (
                <li key={`${source.url}-${source.title}`}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-start gap-2.5 px-3 py-2.5">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
