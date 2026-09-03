import type { PricingPlanId } from "@/constants/pricing-plans"
import { cn } from "@/lib/utils"

type PlanPalette = {
  bright: string
  mid: string
  soft: string
  dark: string
}

const PLAN_PALETTES: Record<PricingPlanId, PlanPalette> = {
  free: { bright: "#67e8f9", mid: "#22d3ee", soft: "#0891b2", dark: "#0e7490" },
  pro: { bright: "#c8f04a", mid: "#a3d43a", soft: "#7cb82a", dark: "#5a8a22" },
  pro_plus: { bright: "#fbbf24", mid: "#f59e0b", soft: "#d97706", dark: "#b45309" },
  premium: { bright: "#d8b4fe", mid: "#c084fc", soft: "#a855f7", dark: "#7c3aed" },
  enterprise: { bright: "#c4b5fd", mid: "#a78bfa", soft: "#8b5cf6", dark: "#6d28d9" },
}

/** Equal squares — size from `--pixel-unit` (responsive in globals.css). */
const UNIT = "var(--pixel-unit)"

type Origin = "top-left" | "top-right" | "bottom-left" | "bottom-right"

type Cell = {
  origin: Origin
  col: number
  row: number
  tone: keyof PlanPalette
  opacity: number
  glow?: boolean
}

/** Same alternate map as pipeline dense cards. */
const CELLS_DENSE: Cell[] = [
  { origin: "top-left", col: 0, row: 0, tone: "mid", opacity: 0.58 },
  { origin: "top-left", col: 1, row: 0, tone: "bright", opacity: 0.7, glow: true },
  { origin: "top-left", col: 2, row: 0, tone: "soft", opacity: 0.42 },
  { origin: "top-left", col: 0, row: 1, tone: "soft", opacity: 0.48 },
  { origin: "top-left", col: 1, row: 1, tone: "dark", opacity: 0.36 },
  { origin: "top-left", col: 0, row: 2, tone: "mid", opacity: 0.4 },
  { origin: "top-left", col: 2, row: 1, tone: "soft", opacity: 0.34 },
  { origin: "top-left", col: 3, row: 2, tone: "dark", opacity: 0.3 },
  { origin: "top-left", col: 4, row: 3, tone: "soft", opacity: 0.28 },
  { origin: "top-right", col: 0, row: 0, tone: "bright", opacity: 0.68, glow: true },
  { origin: "top-right", col: 1, row: 0, tone: "soft", opacity: 0.4 },
  { origin: "top-right", col: 0, row: 1, tone: "dark", opacity: 0.34 },
  { origin: "bottom-left", col: 0, row: 2, tone: "soft", opacity: 0.38 },
  { origin: "bottom-left", col: 0, row: 1, tone: "mid", opacity: 0.52 },
  { origin: "bottom-left", col: 0, row: 0, tone: "bright", opacity: 0.78, glow: true },
  { origin: "bottom-left", col: 1, row: 0, tone: "dark", opacity: 0.42 },
  { origin: "bottom-left", col: 2, row: 0, tone: "soft", opacity: 0.3 },
  { origin: "bottom-left", col: 1, row: 1, tone: "soft", opacity: 0.32 },
  { origin: "bottom-right", col: 0, row: 0, tone: "bright", opacity: 0.62, glow: true },
  { origin: "bottom-right", col: 1, row: 0, tone: "soft", opacity: 0.36 },
  { origin: "bottom-right", col: 0, row: 1, tone: "dark", opacity: 0.34 },
]

const CELLS_SPARSE: Cell[] = [
  { origin: "top-left", col: 0, row: 0, tone: "soft", opacity: 0.5 },
  { origin: "top-left", col: 1, row: 0, tone: "mid", opacity: 0.44 },
  { origin: "top-left", col: 0, row: 1, tone: "dark", opacity: 0.36 },
  { origin: "top-right", col: 0, row: 0, tone: "bright", opacity: 0.72, glow: true },
  { origin: "top-right", col: 1, row: 0, tone: "soft", opacity: 0.38 },
  { origin: "top-right", col: 0, row: 1, tone: "dark", opacity: 0.32 },
  { origin: "top-right", col: 1, row: 1, tone: "soft", opacity: 0.26 },
  { origin: "bottom-left", col: 0, row: 0, tone: "bright", opacity: 0.8, glow: true },
  { origin: "bottom-left", col: 1, row: 0, tone: "dark", opacity: 0.4 },
  { origin: "bottom-left", col: 0, row: 1, tone: "soft", opacity: 0.42 },
  { origin: "bottom-right", col: 2, row: 2, tone: "soft", opacity: 0.34 },
  { origin: "bottom-right", col: 1, row: 1, tone: "mid", opacity: 0.48 },
  { origin: "bottom-right", col: 0, row: 0, tone: "bright", opacity: 0.74, glow: true },
  { origin: "bottom-right", col: 1, row: 0, tone: "dark", opacity: 0.36 },
]

export function PricingPixelDecor({
  planId,
  className,
}: {
  planId: PricingPlanId
  className?: string
}) {
  const palette = PLAN_PALETTES[planId] ?? PLAN_PALETTES.free
  // Alternate dense / sparse by plan order for visual variety
  const planOrder: PricingPlanId[] = ["free", "pro", "pro_plus", "premium", "enterprise"]
  const dense = planOrder.indexOf(planId) % 2 === 0
  const cells = dense ? CELLS_DENSE : CELLS_SPARSE

  return (
    <div
      className={cn(
        "pricing-pixel-decor pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {cells.map((cell, index) => {
        const offsetX = `calc(${cell.col} * ${UNIT})`
        const offsetY = `calc(${cell.row} * ${UNIT})`
        const position =
          cell.origin === "top-left"
            ? { top: offsetY, left: offsetX }
            : cell.origin === "top-right"
              ? { top: offsetY, right: offsetX }
              : cell.origin === "bottom-left"
                ? { bottom: offsetY, left: offsetX }
                : { bottom: offsetY, right: offsetX }

        return (
          <span
            key={index}
            className="pricing-pixel-decor__cell absolute block"
            style={{
              ...position,
              width: UNIT,
              height: UNIT,
              backgroundColor: palette[cell.tone],
              ["--pixel-opacity" as string]: String(cell.opacity),
              boxShadow: cell.glow
                ? `0 0 14px ${palette.bright}88, 0 0 28px ${palette.bright}44`
                : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
