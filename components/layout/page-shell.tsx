import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type MaxWidth = "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"

const maxWidthClass: Record<MaxWidth, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
}

interface PageShellProps {
  children: ReactNode
  maxWidth?: MaxWidth
  className?: string
}

export function PageShell({ children, maxWidth = "6xl", className }: PageShellProps) {
  return (
    <div className={cn("container mx-auto p-4 sm:p-6", maxWidthClass[maxWidth], className)}>
      {children}
    </div>
  )
}
