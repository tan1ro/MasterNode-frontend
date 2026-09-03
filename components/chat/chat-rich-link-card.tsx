"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface YouTubeArtifact {
  video_id: string
  url: string
  title: string
  channel?: string
  thumbnail_url?: string
}

function extractYouTubeVideoId(rawHref: string): string | null {
  try {
    const url = new URL(rawHref)
    const host = url.hostname.replace(/^www\./, "").toLowerCase()

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id || null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v")
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null
    }
  } catch {
    return null
  }
  return null
}

export function isYouTubeUrl(href: string | undefined | null): boolean {
  if (!href) return false
  return Boolean(extractYouTubeVideoId(href))
}

export function extractStandaloneMarkdownLink(
  children: React.ReactNode
): { href: string; label: string } | null {
  const nodes = React.Children.toArray(children).filter((child) => {
    return !(typeof child === "string" && child.trim() === "")
  })

  if (nodes.length !== 1) return null
  const only = nodes[0]
  if (!React.isValidElement(only)) return null

  const href = typeof only.props.href === "string" ? only.props.href : ""
  if (!isYouTubeUrl(href)) return null

  const labelText = React.Children.toArray(only.props.children)
    .map((part) => (typeof part === "string" ? part : ""))
    .join("")
    .trim()

  return {
    href,
    label: labelText || "Open on YouTube",
  }
}

type OEmbedMeta = {
  title: string
  channel: string
  thumbnailUrl: string
}

export function ChatRichLinkCard({
  href,
  label,
  channel,
  thumbnailUrl,
}: {
  href: string
  label: string
  channel?: string
  thumbnailUrl?: string
}) {
  const videoId = extractYouTubeVideoId(href)
  const [oembed, setOembed] = useState<OEmbedMeta | null>(null)

  useEffect(() => {
    if (!href || (label && channel)) return
    let cancelled = false
    void fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(href)}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setOembed({
          title: String(data.title || label || "YouTube video"),
          channel: String(data.author_name || channel || ""),
          thumbnailUrl: String(data.thumbnail_url || thumbnailUrl || ""),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [href, label, channel, thumbnailUrl])

  if (!videoId) return null

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  const displayTitle = oembed?.title || label || "YouTube video"
  const displayChannel = channel || oembed?.channel || "YouTube"
  const thumb = thumbnailUrl || oembed?.thumbnailUrl

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-border/60 bg-background/40 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 dark:border-white/10">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600/90 text-xs font-bold text-white">
            YT
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{displayTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{displayChannel}</p>
        </div>
      </div>
      <div className="aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title={displayTitle}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="border-t border-border/50 px-4 py-3 dark:border-white/10">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border/60",
            "bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/50"
          )}
        >
          youtube.com
        </a>
      </div>
    </div>
  )
}

export function ChatYouTubeArtifactCard({ artifact }: { artifact: YouTubeArtifact }) {
  return (
    <ChatRichLinkCard
      href={artifact.url}
      label={artifact.title}
      channel={artifact.channel}
      thumbnailUrl={artifact.thumbnail_url}
    />
  )
}
