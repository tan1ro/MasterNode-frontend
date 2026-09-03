"use client"

import React from "react"
import { SourceFavicon } from "@/components/chat/chat-source-favicon"
import { siteLabelFromSource } from "@/lib/chat-source-labels"
import type { WebSearchSource } from "@/types/api"
import { cn } from "@/lib/utils"

/** Inline favicon + publisher link (replaces numbered [1] citations in prose). */
export function InlineSourceLink({
  source,
  className,
  children,
}: {
  source: WebSearchSource
  className?: string
  children?: React.ReactNode
}) {
  const url = source.url?.trim()
  const label = children ?? siteLabelFromSource(source)

  if (!url) {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-md bg-muted/85 px-1.5 py-0.5 text-[11px] leading-none text-foreground/90",
          className
        )}
      >
        <SourceFavicon url={source.url || ""} className="h-3 w-3 shrink-0 rounded-[2px]" />
        <span className="truncate">{label}</span>
      </span>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md bg-muted/85 px-1.5 py-0.5",
        "relative z-[1] cursor-pointer pointer-events-auto",
        "text-[11px] font-normal leading-none text-foreground/90 no-underline",
        "hover:bg-muted transition-colors align-middle",
        className
      )}
    >
      <SourceFavicon url={url} className="h-3 w-3 shrink-0 rounded-[2px]" />
      <span className="truncate">{label}</span>
    </a>
  )
}
