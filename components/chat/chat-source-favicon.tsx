"use client"

import React, { useState } from "react"
import { Globe } from "lucide-react"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"
import { faviconUrlForDomain } from "@/lib/favicon-url"
import type { WebSearchSource } from "@/types/api"
import { cn } from "@/lib/utils"

export function SourceFavicon({ url, className }: { url: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const domain = hostnameFromUrl(url)
  if (!domain) return null
  if (failed) {
    return <Globe className={cn("shrink-0 text-muted-foreground", className)} aria-hidden />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrlForDomain(domain)}
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      className={cn("rounded-sm bg-background object-contain", className)}
    />
  )
}

export function SourceFaviconStack({
  sources,
  className,
  iconClassName,
}: {
  sources: WebSearchSource[]
  className?: string
  iconClassName?: string
}) {
  const preview = sources.slice(0, 3)
  return (
    <span className={cn("inline-flex items-center -space-x-1.5", className)} aria-hidden>
      {preview.map((source, index) => (
        <span
          key={`${source.url}-${index}`}
          className="inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-background bg-muted"
        >
          <SourceFavicon url={source.url} className={cn("h-3 w-3", iconClassName)} />
        </span>
      ))}
    </span>
  )
}
