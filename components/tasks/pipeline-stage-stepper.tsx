"use client"

import { Check, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskMilestoneRow } from "@/lib/task-live-execution"

function StageNode({ status }: { status: TaskMilestoneRow["status"] }) {
  if (status === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/40">
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
      </span>
    )
  }
  if (status === "running") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-2 ring-amber-500/50">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400" aria-hidden />
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/60 ring-2 ring-border/60">
      <Circle className="h-2.5 w-2.5 text-muted-foreground/45" aria-hidden />
    </span>
  )
}

function StageStatusPill({ status }: { status: TaskMilestoneRow["status"] }) {
  const label = status === "done" ? "Done" : status === "running" ? "Running" : "Waiting"
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        status === "done" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        status === "running" && "bg-amber-500/20 text-amber-800 dark:text-amber-200",
        status === "waiting" && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  )
}

export interface PipelineStageStepperProps {
  stages: TaskMilestoneRow[]
  /** Optional parallel worker summary for the parallel stage row. */
  parallelSummary?: { completed: number; total: number; running: number } | null
  className?: string
  compact?: boolean
}

export function PipelineStageStepper({
  stages,
  parallelSummary = null,
  className,
  compact = false,
}: PipelineStageStepperProps) {
  if (stages.length === 0) return null

  return (
    <ol className={cn("relative", className)} aria-label="Pipeline stages">
      {stages.map((stage, index) => {
        const isParallel =
          stage.id.replace(/^pipeline:/, "").toLowerCase() === "parallel" ||
          stage.label.toLowerCase().includes("parallel")
        const showWorkers =
          isParallel && parallelSummary && parallelSummary.total > 0

        return (
          <li key={stage.id} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <StageNode status={stage.status} />
              {index < stages.length - 1 ? (
                <div
                  className={cn(
                    "my-1 w-px flex-1 min-h-[0.75rem]",
                    stage.status === "done" ? "bg-emerald-500/45" : "bg-border/70"
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-2.5 py-2 mb-2 bg-card",
                stage.status === "running" && "border-amber-500/45",
                stage.status === "done" && "border-border/50",
                stage.status === "waiting" && "border-border/35"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    compact ? "text-[11px]" : "text-xs",
                    "font-medium leading-snug",
                    stage.status === "running" && "text-amber-800 dark:text-amber-100",
                    stage.status === "done" && "text-foreground",
                    stage.status === "waiting" && "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
                <StageStatusPill status={stage.status} />
              </div>
              {showWorkers ? (
                <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                  Workers {parallelSummary.completed}/{parallelSummary.total}
                  {parallelSummary.running > 0
                    ? ` · ${parallelSummary.running} active`
                    : ""}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
