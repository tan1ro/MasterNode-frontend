"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardGroupProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
  rows?: 1 | 2
  className?: string
}

export function CardGroup({ children, cols = 2, rows, className }: CardGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[cols], className)}>
      {children}
    </div>
  )
}
