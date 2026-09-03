"use client"

import { useEffect, useState } from "react"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { cn } from "@/lib/utils"

const ACCENT_COLORS = [
  "#B0F900",
  "#8750CC",
  "#FFA600",
  "#00FFFE",
  "#00D27E",
  "#7B5EA7",
] as const

/** Fewer squares — spaced so they never stack on each other. */
const SCROLL_SQUARE_COUNT = 14

type ScrollSquareEdge = "left" | "right" | "top" | "bottom"

type ScrollSquareConfig = {
  axis: number
  edge: ScrollSquareEdge
  inset: number
  size: number
  color: string
  opacity: number
  delayMs: number
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return round4(value - Math.floor(value))
}

/**
 * Place squares in non-overlapping slots along each edge.
 * Slot centers are evenly spaced; size is capped so neighbors never collide.
 */
function buildScrollSquares(
  count: number,
  orientation: "vertical" | "horizontal"
): ScrollSquareConfig[] {
  const vertical = orientation === "vertical"
  const edgeA: ScrollSquareEdge = vertical ? "left" : "top"
  const edgeB: ScrollSquareEdge = vertical ? "right" : "bottom"
  const perEdge = Math.max(1, Math.ceil(count / 2))
  const pad = 6
  const usable = 100 - pad * 2
  const slotSpan = usable / perEdge
  /** Gap between squares as a fraction of slot span. */
  const gapFraction = 0.28

  const squares: ScrollSquareConfig[] = []

  for (let edgeIndex = 0; edgeIndex < 2; edgeIndex++) {
    const edge = edgeIndex === 0 ? edgeA : edgeB
    const edgeCount =
      edgeIndex === 0 ? Math.ceil(count / 2) : Math.floor(count / 2)

    for (let i = 0; i < edgeCount; i++) {
      const seedBase = edgeIndex * 100 + i * 17
      const slotStart = pad + i * slotSpan
      const slotCenter = slotStart + slotSpan / 2
      // Keep jitter inside the safe inner band so neighbors never collide
      const jitter = (seededUnit(seedBase + 1) - 0.5) * slotSpan * 0.18
      const axis = round4(Math.min(100 - pad, Math.max(pad, slotCenter + jitter)))

      // Size budget from slot height (~viewport) so squares stay within their lane
      const approxViewport = 900
      const slotPx = (slotSpan / 100) * approxViewport
      const maxSize = Math.max(20, Math.floor(slotPx * (1 - gapFraction)))
      const size = Math.round(20 + seededUnit(seedBase + 2) * Math.min(32, maxSize - 20))

      squares.push({
        axis,
        edge,
        inset: round4(1.4 + seededUnit(seedBase + 3) * 2.8),
        size,
        color: ACCENT_COLORS[Math.floor(seededUnit(seedBase + 4) * ACCENT_COLORS.length)],
        opacity: round4(0.14 + seededUnit(seedBase + 5) * 0.2),
        delayMs: Math.round(seededUnit(seedBase + 6) * 360),
      })
    }
  }

  return squares
}

function HomeScrollSquare({
  square,
  revealedOnMount = false,
  orientation,
}: {
  square: ScrollSquareConfig
  revealedOnMount?: boolean
  orientation: "vertical" | "horizontal"
}) {
  const { ref, visible: scrollVisible } = useHomeScrollReveal(0.06)
  const visible = revealedOnMount || scrollVisible
  const vertical = orientation === "vertical"

  return (
    <span
      ref={ref}
      className={cn(
        "home-scroll-square absolute",
        vertical ? "home-scroll-square--vertical" : "home-scroll-square--horizontal",
        visible && "home-scroll-square--visible"
      )}
      style={{
        top: vertical
          ? `${square.axis}%`
          : square.edge === "top"
            ? `${square.inset}%`
            : undefined,
        bottom: !vertical && square.edge === "bottom" ? `${square.inset}%` : undefined,
        left: vertical
          ? square.edge === "left"
            ? `${square.inset}%`
            : undefined
          : `${square.axis}%`,
        right: vertical && square.edge === "right" ? `${square.inset}%` : undefined,
        width: square.size,
        height: square.size,
        backgroundColor: square.color,
        ["--home-scroll-square-color" as string]: square.color,
        ["--home-scroll-square-opacity" as string]: String(square.opacity),
        transitionDelay: visible ? `${square.delayMs}ms` : undefined,
      }}
    />
  )
}

export function HomeScrollSquares({
  className,
  fixed = false,
  revealedOnMount = false,
  count = SCROLL_SQUARE_COUNT,
  orientation = "vertical",
}: {
  className?: string
  /** Pin squares to the viewport (auth / onboarding shells). */
  fixed?: boolean
  /** Show all squares on mount without waiting for scroll. */
  revealedOnMount?: boolean
  count?: number
  /** Vertical = left/right rails; horizontal = top/bottom rails. */
  orientation?: "vertical" | "horizontal"
}) {
  const [squares, setSquares] = useState<ScrollSquareConfig[] | null>(null)

  useEffect(() => {
    setSquares(buildScrollSquares(count, orientation))
  }, [count, orientation])

  return (
    <div
      className={cn(
        "pointer-events-none inset-0 z-[1] overflow-hidden",
        fixed ? "fixed" : "absolute",
        className
      )}
      aria-hidden
    >
      {squares?.map((square, index) => (
        <HomeScrollSquare
          key={index}
          square={square}
          revealedOnMount={revealedOnMount}
          orientation={orientation}
        />
      ))}
    </div>
  )
}
