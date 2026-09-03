"use client"

import { useMemo } from "react"
import { TaskDetailSection } from "@/components/tasks/task-detail-section"
import { useTaskMetrics, taskMetricsFetchEnabled } from "@/hooks/use-metrics"
import { cn } from "@/lib/utils"
import {
  buildLlmContributionRows,
  buildStageProgressRows,
  type StageProgressRow,
} from "@/lib/task-stage-metrics"
import { LlmContributionTable } from "@/components/tasks/llm-contribution-table"
import { LlmProviderBadge } from "@/components/tasks/llm-provider-badge"
import type { Task } from "@/types/api"

function StatusBadge({ status }: { status: StageProgressRow["status"] }) {
  const cls =
    status === "done"
      ? "bg-emerald/15 text-emerald border-emerald/30"
      : status === "running"
        ? "bg-violet/15 text-violet border-violet/30"
        : "bg-muted text-muted-foreground border-border"
  const label = status === "done" ? "Done" : status === "running" ? "Running" : "Waiting"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        cls
      )}
    >
      {label}
    </span>
  )
}

interface TaskStageProgressProps {
  taskId: string
  task: Pick<Task, "status" | "partial_results">
}

export function TaskStageProgress({ taskId, task }: TaskStageProgressProps) {
  const poll =
    task.status === "running" ||
    task.status === "decomposing"

  const { data, isLoading, isError } = useTaskMetrics(
    taskId,
    Boolean(taskId) && taskMetricsFetchEnabled(task.status),
    poll ? 2000 : false
  )

  const metrics = data?.metrics

  const stageRows = useMemo(() => buildStageProgressRows(task, metrics), [task, metrics])
  const llmRows = useMemo(
    () => buildLlmContributionRows(metrics, task.partial_results),
    [metrics, task.partial_results]
  )

  if (isError && !isLoading) {
    return (
      <TaskDetailSection
        title="Stage progress & LLM usage"
        description="No execution metrics for this task yet (for example after an API restart). Run a new task to capture per-step LLM data."
      />
    )
  }

  return (
    <TaskDetailSection
      title="Stage progress"
      description="LLM provider and timing recorded for each pipeline step"
      contentClassName="space-y-6"
    >
      {isLoading && !metrics ? (
        <p className="text-sm text-muted-foreground">Loading metrics…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">LLM</th>
                  <th className="px-3 py-2 w-20">Time</th>
                  <th className="px-3 py-2 min-w-[120px]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {stageRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/30 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      <div className="min-w-0">
                        <p>{row.stage}</p>
                        {row.stageDetail ? (
                          <p className="mt-0.5 text-xs font-normal leading-snug text-muted-foreground line-clamp-2">
                            {row.stageDetail}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <LlmProviderBadge provider={row.llm} showAutoRoute={false} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{row.timeLabel}</td>
                    <td className="px-3 py-2.5">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            row.status === "done" && "bg-emerald",
                            row.status === "running" && "bg-violet animate-pulse",
                            row.status === "waiting" && "bg-transparent"
                          )}
                          style={{ width: `${row.progressPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {llmRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold font-heading mb-2">LLM contribution (this task)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Stage time share for auto-routed steps; named providers show API call share when usage is tracked separately. Stages list where each provider ran.
              </p>
              <LlmContributionTable
                rows={llmRows}
                stageAttributionAvailable={Boolean(
                  metrics?.stage_provider_calls &&
                    Object.keys(metrics.stage_provider_calls).length > 0
                )}
              />
            </div>
          )}
        </>
      )}
    </TaskDetailSection>
  )
}
