"use client"

import { ExternalLink } from "lucide-react"
import { SourceFavicon } from "@/components/chat/chat-source-favicon"
import { siteLabelFromSource } from "@/lib/chat-source-labels"
import type { NewsArtifact } from "@/lib/chat-news-artifact"
import { cn } from "@/lib/utils"

interface ChatNewsArtifactProps {
  artifact: NewsArtifact
  className?: string
}

export function ChatNewsArtifact({ artifact, className }: ChatNewsArtifactProps) {
  const headlines = artifact.headlines.slice(0, 5)
  if (headlines.length === 0) return null

  return (
    <div className={cn("mb-3 space-y-2", className)}>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {headlines.map((headline) => {
          const label = siteLabelFromSource({
            title: headline.title,
            url: headline.url,
            source: headline.publisher || headline.source,
          })
          return (
            <a
              key={`${headline.url}-${headline.title}`}
              href={headline.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex min-w-[min(18rem,78vw)] max-w-[20rem] shrink-0 flex-col",
                "rounded-xl border border-border/60 bg-muted/25 p-3 shadow-sm",
                "transition-colors hover:border-border hover:bg-muted/40"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <SourceFavicon url={headline.url} className="h-4 w-4 shrink-0 rounded-sm" />
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {label}
                </span>
                <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="line-clamp-3 text-sm font-semibold leading-snug text-foreground">
                {headline.title}
              </p>
              {headline.published_label ? (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {headline.published_label}
                </p>
              ) : null}
            </a>
          )
        })}
      </div>
    </div>
  )
}
