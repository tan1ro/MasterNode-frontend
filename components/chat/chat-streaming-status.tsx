"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { PI_MARK, PI_MARK_ANIMATED } from "@/constants/branding-assets"
import { cn } from "@/lib/utils"

const animatedMarkSrc = PI_MARK_ANIMATED.src.src

/** Warm the thinking GIF so the first send does not flash an empty badge. */
export function preloadPiThinkingMark() {
  if (typeof window === "undefined") return
  const img = new window.Image()
  img.src = animatedMarkSrc
}

if (typeof window !== "undefined") {
  preloadPiThinkingMark()
}

function formatStatusLabel(label: string): string {
  const trimmed = label.trim()
  if (!trimmed) return "Thinking…"
  if (trimmed.endsWith("…") || trimmed.endsWith("...")) return trimmed
  return `${trimmed}…`
}

/**
 * Animated π mark for the streaming / live-thought indicator.
 * Source GIF already has a transparent backdrop — do not paint a black stage,
 * and avoid aggressive zoom so the mark has breathing room in the badge.
 */
export function PiThinkingMark({ className }: { className?: string }) {
  const [gifReady, setGifReady] = useState(false)

  useEffect(() => {
    preloadPiThinkingMark()
  }, [])

  return (
    <span
      className={cn(
        "relative inline-block h-11 w-11 shrink-0 overflow-hidden",
        className
      )}
    >
      <Image
        src={PI_MARK.src}
        alt=""
        fill
        sizes="44px"
        priority
        className={cn(
          "object-contain object-center transition-opacity duration-200",
          gifReady ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      />
      <Image
        src={PI_MARK_ANIMATED.src}
        alt=""
        fill
        sizes="44px"
        priority
        unoptimized
        onLoad={() => setGifReady(true)}
        className={cn(
          "object-cover object-center scale-[1.85] origin-center transition-opacity duration-200",
          gifReady ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
    </span>
  )
}

/** Claude-style streaming row: pulsing mark on the left + shimmering status text. */
export function ChatStreamingStatus({
  label = "Thinking",
  className,
}: {
  label?: string
  className?: string
}) {
  const display = formatStatusLabel(label)

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      aria-label={display}
      role="status"
      aria-live="polite"
    >
      <PiThinkingMark />
      <span className="text-shimmer text-sm font-semibold leading-snug">{display}</span>
    </div>
  )
}
