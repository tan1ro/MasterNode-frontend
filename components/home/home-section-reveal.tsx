"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Match hero headline / tagline / content timing. */
export const SECTION_REVEAL = {
  firstLine: 140,
  lineStagger: 110,
  tagline: 480,
  divider: 380,
  content: 560,
} as const

export function sectionLineDelay(index: number): number {
  return SECTION_REVEAL.firstLine + index * SECTION_REVEAL.lineStagger
}

export function HomeSectionRevealItem({
  as: Tag = "span",
  visible,
  reducedMotion = false,
  delayMs = SECTION_REVEAL.firstLine,
  className,
  children,
  ...props
}: {
  as?: "span" | "p" | "h2" | "div"
  visible: boolean
  reducedMotion?: boolean
  delayMs?: number
  className?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  const showInstant = reducedMotion

  return (
    <Tag
      {...props}
      className={cn(
        !showInstant && "home-section-reveal-item",
        visible && !showInstant && "home-section-reveal-item--active",
        className
      )}
      style={
        showInstant
          ? undefined
          : { transitionDelay: visible ? `${delayMs}ms` : "0ms" }
      }
    >
      {children}
    </Tag>
  )
}

export function useSectionContentReveal(
  visible: boolean,
  reducedMotion: boolean,
  delayMs: number = SECTION_REVEAL.content
): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return
    if (!visible) return
    if (reducedMotion) {
      setReady(true)
      return
    }
    const id = window.setTimeout(() => setReady(true), delayMs)
    return () => window.clearTimeout(id)
  }, [visible, reducedMotion, delayMs, ready])

  return ready
}
