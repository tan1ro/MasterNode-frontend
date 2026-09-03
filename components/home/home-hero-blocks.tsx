"use client"

import { cn } from "@/lib/utils"

type Block = {
  col: number
  row: number
  color: string
  opacity?: number
  blur?: boolean
}

/** π-shaped block mark — column/row grid matches landing hero artboard */
const HERO_BLOCKS: Block[] = [
  { col: 0, row: 0, color: "#2DCFCF" },
  { col: 1, row: 0, color: "#00FFFE" },
  { col: 2, row: 0, color: "#2DCFCF" },
  { col: 3, row: 0, color: "#FFA600" },
  { col: 4, row: 0, color: "#FFA600", opacity: 0.55 },
  { col: 5, row: 0, color: "#FFA600", opacity: 0.55 },

  { col: 0, row: 1, color: "#00FFFE" },
  { col: 1, row: 1, color: "#2DCFCF", opacity: 0.85 },
  { col: 3, row: 1, color: "#FFA702" },
  { col: 4, row: 1, color: "#FFA600", opacity: 0.53 },
  { col: 5, row: 1, color: "#FFA600", opacity: 0.53 },

  { col: 0, row: 2, color: "#2DCFCF" },
  { col: 1, row: 2, color: "#8750CC", opacity: 0.51 },
  { col: 2, row: 2, color: "#8750CC" },
  { col: 3, row: 2, color: "#FFA702" },
  { col: 4, row: 2, color: "#E8703A" },
  { col: 5, row: 2, color: "#FFA702" },

  { col: 0, row: 3, color: "#00FFFE", opacity: 0.6 },
  { col: 1, row: 3, color: "#8750CC", opacity: 0.51, blur: true },
  { col: 3, row: 3, color: "#FFA702" },
  { col: 4, row: 3, color: "#E8703A" },
  { col: 5, row: 3, color: "#E8703A" },

  { col: 0, row: 4, color: "#2DCFCF" },
  { col: 3, row: 4, color: "#E8703A" },
  { col: 4, row: 4, color: "#E8703A" },
  { col: 5, row: 4, color: "#E8703A" },

  { col: 0, row: 5, color: "#00FFFE" },
  { col: 3, row: 5, color: "#E8703A" },
  { col: 4, row: 5, color: "#E8703A" },
  { col: 5, row: 5, color: "#E8703A" },
]

const AMBIENT_BLOCKS: Block[] = [
  { col: -1, row: 1, color: "#8750CC", opacity: 0.45, blur: true },
  { col: 6, row: 0, color: "#FFA600", opacity: 0.4, blur: true },
  { col: 6, row: 3, color: "#8750CC", opacity: 0.35 },
  { col: -1, row: 4, color: "#FFA600", opacity: 0.5, blur: true },
  { col: 2, row: -1, color: "#B0F900", opacity: 0.35, blur: true },
  { col: 5, row: -1, color: "#8750CC", opacity: 0.4, blur: true },
]

const CELL = "min(13vw, 5.25rem)"
const CELL_LG = "min(12vw, 6rem)"

export function HomeHeroBlocks({
  className,
  size = "default",
}: {
  className?: string
  size?: "default" | "lg"
}) {
  const cell = size === "lg" ? CELL_LG : CELL
  return (
    <div
      className={cn("relative mx-auto w-full max-w-[36rem]", className)}
      aria-hidden
    >
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(6, ${cell})`,
          gridTemplateRows: `repeat(6, ${cell})`,
          gap: "0.3rem",
        }}
      >
        {[...HERO_BLOCKS, ...AMBIENT_BLOCKS].map((block, i) => (
          <span
            key={`${block.col}-${block.row}-${i}`}
            className={cn("block", block.blur && "blur-lg")}
            style={{
              gridColumn: block.col + 2,
              gridRow: block.row + 2,
              backgroundColor: block.color,
              opacity: block.opacity ?? 1,
              boxShadow: `0 0 20px ${block.color}44`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
