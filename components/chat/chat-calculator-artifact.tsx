"use client"

import { Calculator } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalculatorArtifact {
  kind: "math" | "unit"
  expression: string
  result: number
  result_label: string
  from_unit?: string | null
  to_unit?: string | null
}

export function ChatCalculatorArtifact({
  artifact,
  className,
}: {
  artifact: CalculatorArtifact
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Calculator className="h-3.5 w-3.5" />
        {artifact.kind === "unit" ? "Unit conversion" : "Calculator"}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{artifact.expression}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {artifact.result_label}
      </p>
    </div>
  )
}
