"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Layers, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreatorTaskSection } from "@/components/tasks/creator/creator-task-section"
import { LlmProviderBadge } from "@/components/tasks/llm-provider-badge"
import { useTaskMetrics, taskMetricsFetchEnabled } from "@/hooks/use-metrics"
import { buildStageProgressRows, type StageProgressRow } from "@/lib/task-stage-metrics"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/api"

const COLLAPSED_STEP_COUNT = 4

function stepStatusLabel(status: StageProgressRow["status"]): string {
  if (status === "done") return "Done"
  if (status === "running") return "In progress"
  return "Waiting"
}

function StepStatusDot({ status }: { status: StageProgressRow["status"] }) {
  const cls =
    status === "done"
      ? "bg-emerald-500"
      : status === "running"
        ? "bg-amber-500 animate-pulse"
        : "bg-muted-foreground/35"
  return <span className={cn("mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full", cls)} aria-hidden />
}

function PipelineStepCard({ row }: { row: StageProgressRow }) {
  return (
    <div className="creator-task-step-card">
      <div className="flex min-w-0 items-start gap-2.5">
        <StepStatusDot status={row.status} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{row.stage}</p>
          {row.stageDetail ? (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">
              {row.stageDetail}
            </p>
          ) : null}
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {stepStatusLabel(row.status)}
          </p>
        </div>
      </div>
      <div className="creator-task-step-meta">
        <LlmProviderBadge provider={row.llm} showAutoRoute={false} />
        <span className="text-xs tabular-nums text-muted-foreground">{row.timeLabel}</span>
      </div>
    </div>
  )
}

export function CreatorTaskLlmContribution({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false)

  const poll =
    task.status === "running" ||
    task.status === "decomposing"

  const { data, isLoading } = useTaskMetrics(
    task.task_id,
    taskMetricsFetchEnabled(task.status),
    poll ? 2000 : false
  )

  const metrics = data?.metrics

  const stageRows = useMemo(
    () =>
      buildStageProgressRows(task, metrics).filter(
        (row) => row.status !== "waiting" || row.timeLabel !== "—"
      ),
    [task, metrics]
  )

  const hiddenCount = Math.max(0, stageRows.length - COLLAPSED_STEP_COUNT)
  const visibleRows = expanded ? stageRows : stageRows.slice(0, COLLAPSED_STEP_COUNT)

  if (isLoading && !metrics) {
    return (
      <CreatorTaskSection
        title="How this was built"
        description="A quick look at the steps behind your result."
        icon={Layers}
      >
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading steps…
        </div>
      </CreatorTaskSection>
    )
  }

  if (stageRows.length === 0) {
    return null
  }

  return (
    <CreatorTaskSection
      title="How this was built"
      description="Each step below shows what ran and which AI model handled it."
      icon={Layers}
      contentClassName="space-y-3 border-0 bg-transparent p-0"
    >
      <div className="creator-task-step-list">
        {visibleRows.map((row) => (
          <PipelineStepCard key={row.id} row={row} />
        ))}
      </div>

      {hiddenCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="creator-task-view-more h-9 gap-1.5"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden />
              Show fewer steps
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden />
              Show {hiddenCount} more step{hiddenCount === 1 ? "" : "s"}
            </>
          )}
        </Button>
      ) : null}
    </CreatorTaskSection>
  )
}
