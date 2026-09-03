"use client"

import { Loader2 } from "lucide-react"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { CustomAgentsBadges } from "@/components/tasks/custom-agents-badges"
import { TaskDetailSection } from "@/components/tasks/task-detail-section"
import { formatUserDateTime } from "@/lib/datetime-local"
import { useTaskMetrics, taskMetricsFetchEnabled } from "@/hooks/use-metrics"
import { buildTokenShareSummary } from "@/lib/task-stage-metrics"
import type { Task } from "@/types/api"

interface TaskInfoSidebarProps {
  task: Task
}

export function TaskInfoSidebar({ task }: TaskInfoSidebarProps) {
  const poll =
    task.status === "running" ||
    task.status === "decomposing"
  const metricsEnabled = taskMetricsFetchEnabled(task.status)
  const { data: metricsData, isLoading: metricsLoading } = useTaskMetrics(
    task.task_id,
    metricsEnabled,
    poll ? 2000 : false
  )
  const tokenSummary = buildTokenShareSummary(metricsData?.metrics)

  return (
    <TaskDetailSection title="Task information">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <TaskStatusBadge status={task.status} className="text-base mt-1" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
            Pipeline agents
          </p>
          <CustomAgentsBadges templateIds={task.template_ids} />
          {!task.template_ids ||
          !Object.entries(task.template_ids).some(([, v]) => v && String(v).trim()) ? (
            <p className="text-xs text-muted-foreground">Default prompts for all stages.</p>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
          <p className="text-sm tabular-nums">{formatUserDateTime(task.created_at)}</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Updated</p>
          <p className="text-sm tabular-nums">{formatUserDateTime(task.updated_at)}</p>
        </div>

        <div className="min-w-0 sm:col-span-2 lg:col-span-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Context usage
          </p>
          {metricsLoading && !tokenSummary ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Measuring token usage...
            </div>
          ) : tokenSummary ? (
            <div className="mt-2 rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{Math.min(tokenSummary.inputSharePct, 100)}% full</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  ~{tokenSummary.promptTokens.toLocaleString()} / {tokenSummary.totalTokens.toLocaleString()} input
                  {" "}tokens
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.min(tokenSummary.inputSharePct, 100)}%` }}
                />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center justify-between gap-3 sm:block">
                  <p className="text-xs uppercase tracking-wide">Input</p>
                  <p className="tabular-nums">
                    {tokenSummary.promptTokens.toLocaleString()} tokens
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block">
                  <p className="text-xs uppercase tracking-wide">Output</p>
                  <p className="tabular-nums">
                    {tokenSummary.completionTokens.toLocaleString()} tokens
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block">
                  <p className="text-xs uppercase tracking-wide">Total</p>
                  <p className="tabular-nums">
                    {tokenSummary.totalTokens.toLocaleString()} tokens
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Usage will appear after the task starts calling models.</p>
          )}
        </div>

        {task.error ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-sm font-medium text-destructive mb-2">Error</p>
            <p className="text-sm text-destructive">{task.error}</p>
          </div>
        ) : null}
      </div>
    </TaskDetailSection>
  )
}
