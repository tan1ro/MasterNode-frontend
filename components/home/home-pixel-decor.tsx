import { cn } from "@/lib/utils"

/** Equal square size — driven by `--pixel-unit` for responsive breakpoints. */
const UNIT = "var(--pixel-unit)"

type Tone = "bright" | "mid" | "soft" | "dark"

type Origin = "top-left" | "top-right" | "bottom-left" | "bottom-right"

type Cell = {
  origin: Origin
  col: number
  row: number
  tone: Tone
  opacity: number
  glow?: boolean
}

/**
 * Alternative reference map (2×2 cyan/orange cards):
 * equal squares on a grid, no overlap — dense has diagonal trails,
 * sparse keeps tighter corner L-shapes.
 */
const PANEL_CELLS: Cell[] = [
  // Top-left — heavy cluster + diagonal trail toward center
  { origin: "top-left", col: 0, row: 0, tone: "mid", opacity: 0.58 },
  { origin: "top-left", col: 1, row: 0, tone: "bright", opacity: 0.7, glow: true },
  { origin: "top-left", col: 2, row: 0, tone: "soft", opacity: 0.42 },
  { origin: "top-left", col: 0, row: 1, tone: "soft", opacity: 0.48 },
  { origin: "top-left", col: 1, row: 1, tone: "dark", opacity: 0.36 },
  { origin: "top-left", col: 0, row: 2, tone: "mid", opacity: 0.4 },
  { origin: "top-left", col: 2, row: 1, tone: "soft", opacity: 0.34 },
  { origin: "top-left", col: 3, row: 2, tone: "dark", opacity: 0.3 },
  { origin: "top-left", col: 4, row: 3, tone: "soft", opacity: 0.28 },

  // Top-right — small corner pair + edge step
  { origin: "top-right", col: 0, row: 0, tone: "bright", opacity: 0.68, glow: true },
  { origin: "top-right", col: 1, row: 0, tone: "soft", opacity: 0.4 },
  { origin: "top-right", col: 0, row: 1, tone: "dark", opacity: 0.34 },

  // Bottom-left — stacked L with glowing corner
  { origin: "bottom-left", col: 0, row: 2, tone: "soft", opacity: 0.38 },
  { origin: "bottom-left", col: 0, row: 1, tone: "mid", opacity: 0.52 },
  { origin: "bottom-left", col: 0, row: 0, tone: "bright", opacity: 0.78, glow: true },
  { origin: "bottom-left", col: 1, row: 0, tone: "dark", opacity: 0.42 },
  { origin: "bottom-left", col: 2, row: 0, tone: "soft", opacity: 0.3 },
  { origin: "bottom-left", col: 1, row: 1, tone: "soft", opacity: 0.32 },

  // Bottom-right — corner + short inward step
  { origin: "bottom-right", col: 0, row: 0, tone: "bright", opacity: 0.62, glow: true },
  { origin: "bottom-right", col: 1, row: 0, tone: "soft", opacity: 0.36 },
  { origin: "bottom-right", col: 0, row: 1, tone: "dark", opacity: 0.34 },
]

/** Sparse alternate — corners only, like the top-right reference card. */
const PANEL_CELLS_SPARSE: Cell[] = [
  // Top-left L
  { origin: "top-left", col: 0, row: 0, tone: "soft", opacity: 0.5 },
  { origin: "top-left", col: 1, row: 0, tone: "mid", opacity: 0.44 },
  { origin: "top-left", col: 0, row: 1, tone: "dark", opacity: 0.36 },

  // Top-right with tiny diagonal
  { origin: "top-right", col: 0, row: 0, tone: "bright", opacity: 0.72, glow: true },
  { origin: "top-right", col: 1, row: 0, tone: "soft", opacity: 0.38 },
  { origin: "top-right", col: 0, row: 1, tone: "dark", opacity: 0.32 },
  { origin: "top-right", col: 1, row: 1, tone: "soft", opacity: 0.26 },

  // Bottom-left glowing L
  { origin: "bottom-left", col: 0, row: 0, tone: "bright", opacity: 0.8, glow: true },
  { origin: "bottom-left", col: 1, row: 0, tone: "dark", opacity: 0.4 },
  { origin: "bottom-left", col: 0, row: 1, tone: "soft", opacity: 0.42 },

  // Bottom-right diagonal of three (reference bottom-right card)
  { origin: "bottom-right", col: 2, row: 2, tone: "soft", opacity: 0.34 },
  { origin: "bottom-right", col: 1, row: 1, tone: "mid", opacity: 0.48 },
  { origin: "bottom-right", col: 0, row: 0, tone: "bright", opacity: 0.74, glow: true },
  { origin: "bottom-right", col: 1, row: 0, tone: "dark", opacity: 0.36 },
]

/**
 * Capability map — same grid rules, denser top/side accents.
 */
const CAPABILITY_CELLS: Cell[] = [
  { origin: "top-left", col: 2, row: 0, tone: "bright", opacity: 0.48 },
  { origin: "top-left", col: 1, row: 1, tone: "dark", opacity: 0.3 },
  { origin: "top-left", col: 6, row: 0, tone: "dark", opacity: 0.28 },
  { origin: "top-left", col: 7, row: 0, tone: "dark", opacity: 0.28 },
  { origin: "top-right", col: 1, row: 0, tone: "bright", opacity: 0.46 },
  { origin: "top-right", col: 0, row: 0, tone: "dark", opacity: 0.3 },
  { origin: "top-right", col: 0, row: 1, tone: "bright", opacity: 0.42 },
  { origin: "top-left", col: 9, row: 3, tone: "bright", opacity: 0.44 },
  { origin: "top-left", col: 10, row: 3, tone: "dark", opacity: 0.28 },
  { origin: "top-left", col: 11, row: 3, tone: "dark", opacity: 0.28 },
  { origin: "top-left", col: 10, row: 4, tone: "dark", opacity: 0.26 },
  { origin: "top-left", col: 11, row: 4, tone: "dark", opacity: 0.26 },
  { origin: "top-left", col: 11, row: 5, tone: "dark", opacity: 0.24 },
  { origin: "bottom-left", col: 0, row: 1, tone: "bright", opacity: 0.44 },
  { origin: "bottom-left", col: 0, row: 0, tone: "bright", opacity: 0.5, glow: true },
  { origin: "bottom-left", col: 1, row: 0, tone: "dark", opacity: 0.28 },
  { origin: "bottom-right", col: 0, row: 1, tone: "bright", opacity: 0.42 },
  { origin: "bottom-right", col: 1, row: 0, tone: "dark", opacity: 0.28 },
  { origin: "bottom-right", col: 0, row: 0, tone: "bright", opacity: 0.46 },
]

function paletteFor(accent: string): Record<Tone, string> {
  return {
    bright: accent,
    mid: `color-mix(in srgb, ${accent} 72%, #0a0a0f 28%)`,
    soft: `color-mix(in srgb, ${accent} 48%, #0a0a0f 52%)`,
    dark: `color-mix(in srgb, ${accent} 32%, #0a0a0f 68%)`,
  }
}

function cellStyle(cell: Cell, accent: string) {
  const palette = paletteFor(accent)
  const offsetX = `calc(${cell.col} * ${UNIT})`
  const offsetY = `calc(${cell.row} * ${UNIT})`
  const color = palette[cell.tone]

  const position =
    cell.origin === "top-left"
      ? { top: offsetY, left: offsetX }
      : cell.origin === "top-right"
        ? { top: offsetY, right: offsetX }
        : cell.origin === "bottom-left"
          ? { bottom: offsetY, left: offsetX }
          : { bottom: offsetY, right: offsetX }

  return {
    ...position,
    width: UNIT,
    height: UNIT,
    backgroundColor: color,
    ["--pixel-opacity" as string]: String(cell.opacity),
    boxShadow: cell.glow
      ? `0 0 14px ${accent}88, 0 0 28px ${accent}44`
      : undefined,
  }
}

function mirrorOrigin(origin: Origin): Origin {
  if (origin === "top-left") return "top-right"
  if (origin === "top-right") return "top-left"
  if (origin === "bottom-left") return "bottom-right"
  return "bottom-left"
}

function mirrorCells(cells: Cell[]): Cell[] {
  return cells.map((cell) => ({
    ...cell,
    origin: mirrorOrigin(cell.origin),
  }))
}

const ACCENT_FALLBACKS = ["#00FFFE", "#8750CC", "#FFA600", "#B0F900"] as const

export function HomePixelDecor({
  index = 0,
  className,
  variant = "default",
  accentColor,
  density = "dense",
  mirror = false,
}: {
  index?: number
  className?: string
  variant?: "default" | "capability" | "pricing" | "sparse"
  accentColor?: string
  /** Dense = content-side clusters; sparse = lighter corners. */
  density?: "dense" | "sparse"
  /** Flip left↔right so dense clusters sit on the content side. */
  mirror?: boolean
}) {
  const accent = accentColor ?? ACCENT_FALLBACKS[index % ACCENT_FALLBACKS.length]

  let cells =
    variant === "capability"
      ? CAPABILITY_CELLS
      : variant === "sparse" || density === "sparse"
        ? PANEL_CELLS_SPARSE
        : PANEL_CELLS

  if (mirror && variant !== "capability") {
    cells = mirrorCells(cells)
  }

  return (
    <div
      className={cn(
        "home-pixel-decor pointer-events-none absolute inset-0 z-0 overflow-hidden",
        variant === "capability" && "home-pixel-decor--capability",
        className
      )}
      aria-hidden
    >
      {cells.map((cell, i) => (
        <span
          key={i}
          className="home-pixel-decor__cell absolute block"
          style={cellStyle(cell, accent)}
        />
      ))}
    </div>
  )
}
