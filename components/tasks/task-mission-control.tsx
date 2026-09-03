"use client"

import { useMemo } from "react"
import { Check, Circle, Loader2, Radio } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CustomAgentsBadges } from "@/components/tasks/custom-agents-badges"
import { TASK_LIVE_RUN } from "@/constants/task-live-run"
import { pipelineStageLabel } from "@/constants/pipeline-template-roles"
import { cn } from "@/lib/utils"
import {
  formatLiveTimeAgo,
  taskMissionTitle,
  type TaskLiveLogEntry,
  type TaskMilestoneRow,
  type TaskWorkerAction,
} from "@/lib/task-live-execution"
import { sdlcPhaseLabel } from "@/constants/product-sdlc"
import { useTaskLiveExecution } from "@/hooks/use-task-live-execution"
import type { TaskGraphMetrics } from "@/lib/task-graph-metrics"
import type { Task } from "@/types/api"

function formatRunStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatusBanner({
  statusLabel,
  isActive,
  progressDone,
  progressTotal,
  elapsed,
  streamMode,
}: {
  statusLabel: string
  isActive: boolean
  progressDone: number
  progressTotal: number
  elapsed: string
  streamMode: "live" | "polling" | "synced"
}) {
  const pct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0
  const running = isActive
  const streamLabel =
    streamMode === "live"
      ? TASK_LIVE_RUN.streamLive
      : streamMode === "polling"
        ? TASK_LIVE_RUN.streamPolling
        : TASK_LIVE_RUN.streamSynced

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        running
          ? "border-amber-500/50 bg-amber-500/10"
          : statusLabel.toLowerCase().includes("completed")
            ? "border-emerald-500/40 bg-emerald-500/10"
            : statusLabel.toLowerCase().includes("fail") ||
                statusLabel.toLowerCase().includes("error")
              ? "border-destructive/50 bg-destructive/10"
              : "border-border/60 bg-muted/30"
      )}
    >
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {running ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-950">
              {statusLabel}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {statusLabel}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {progressDone}/{progressTotal} {TASK_LIVE_RUN.metrics.stagesProgress}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium text-foreground tabular-nums">{elapsed}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Radio
            className={cn(
              "h-3 w-3",
              streamMode === "live"
                ? "text-emerald-500 animate-pulse"
                : streamMode === "polling"
                  ? "text-amber-500"
                  : "text-muted-foreground/50"
            )}
          />
          {streamLabel}
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            running ? "bg-amber-500" : "bg-emerald-500"
          )}
          style={{ width: `${Math.max(pct, running ? 8 : pct)}%` }}
        />
      </div>
    </div>
  )
}

function MilestoneIcon({ status }: { status: TaskMilestoneRow["status"] }) {
  if (status === "done") return <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
  if (status === "running")
    return <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
  return <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
}

function LogLine({ entry }: { entry: TaskLiveLogEntry }) {
  return (
    <div className="flex gap-2 text-[11px] leading-snug">
      <span className="shrink-0 text-muted-foreground/70 tabular-nums w-16 text-right">
        {formatLiveTimeAgo(entry.at)}
      </span>
      <span
        className={cn(
          "min-w-0",
          entry.kind === "success" && "text-emerald-600 dark:text-emerald-400",
          entry.kind === "error" && "text-destructive",
          entry.kind === "warning" && "text-amber-600 dark:text-amber-400",
          entry.kind === "info" && "text-muted-foreground"
        )}
      >
        {entry.text}
      </span>
    </div>
  )
}

function GraphMetricsStrip({
  metrics,
}: {
  metrics: TaskGraphMetrics
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      <div className="rounded-md border border-border/50 bg-background/50 px-2.5 py-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {TASK_LIVE_RUN.metrics.agents}
        </p>
        <p className="text-lg font-bold tabular-nums">{metrics.totalNodes}</p>
      </div>
      <div className="rounded-md border border-border/50 bg-background/50 px-2.5 py-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {TASK_LIVE_RUN.metrics.done}
        </p>
        <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {metrics.completedNodes}
        </p>
      </div>
      <div className="rounded-md border border-border/50 bg-background/50 px-2.5 py-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {TASK_LIVE_RUN.metrics.inProgress}
        </p>
        <p className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
          {metrics.runningNodes}
        </p>
      </div>
      <div className="rounded-md border border-border/50 bg-background/50 px-2.5 py-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {TASK_LIVE_RUN.metrics.elapsed}
        </p>
        <p className="text-lg font-bold tabular-nums">{metrics.totalDurationSec.toFixed(1)}s</p>
      </div>
    </div>
  )
}

function WorkerLine({ action }: { action: TaskWorkerAction }) {
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 text-[11px] font-mono">
        <span className="text-amber-600 dark:text-amber-400 font-semibold">{action.verb}</span>
        <span className="text-foreground/90 break-all">{action.target}</span>
        <span className="text-muted-foreground tabular-nums ml-auto shrink-0">
          {formatLiveTimeAgo(action.at)}
        </span>
      </div>
      {action.feedback ? (
        <p
          className={cn(
            "pl-3 text-[11px] font-mono",
            action.status === "ok" && "text-emerald-600 dark:text-emerald-400",
            action.status === "error" && "text-destructive",
            action.status === "pending" && "text-muted-foreground"
          )}
        >
          {action.feedback}
        </p>
      ) : null}
    </div>
  )
}

export interface TaskMissionControlProps {
  task: Task
  templateIds?: Record<string, string> | null
  onPipelineEvent?: () => void
  isTaskFetching?: boolean
  className?: string
}

export function TaskMissionControl({
  task,
  templateIds,
  onPipelineEvent,
  isTaskFetching = false,
  className,
}: TaskMissionControlProps) {
  const {
    logs,
    actions,
    progress,
    milestones,
    progressDone,
    progressTotal,
    elapsed,
    statusLabel: rawStatus,
    isActive,
    streamMode,
    graphMetrics,
  } = useTaskLiveExecution({
    task,
    onPipelineEvent,
    isTaskFetching,
  })

  const statusLabel = formatRunStatus(rawStatus)
  const title = taskMissionTitle(task)
  const activeWorker =
    [...actions].reverse().find((a) => a.status === "pending") ?? actions[actions.length - 1]

  const currentStep =
    graphMetrics?.currentStageLabel ||
    milestones.find((m) => m.status === "running")?.label ||
    (progress?.current_stage
      ? pipelineStageLabel(progress.current_stage.replace(/^pipeline:/, ""))
      : null)

  const workstreamLabel = task.sdlc_phase ? sdlcPhaseLabel(task.sdlc_phase) : "Workspace task"

  return (
    <Card
      variant="minimal"
      interactive={false}
      className={cn("overflow-hidden", className)}
      aria-label={TASK_LIVE_RUN.ariaLabel}
    >
      <div className="border-b border-border/50 px-4 py-3 bg-muted/20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold font-heading tracking-wide text-foreground">
            {TASK_LIVE_RUN.title}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {task.task_id}
          </span>
        </div>
        <StatusBanner
          statusLabel={statusLabel}
          isActive={isActive}
          progressDone={progressDone}
          progressTotal={progressTotal}
          elapsed={elapsed}
          streamMode={streamMode}
        />
        {currentStep ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {TASK_LIVE_RUN.currentStep}:{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">{currentStep}</span>
          </p>
        ) : null}
        {graphMetrics ? <GraphMetricsStrip metrics={graphMetrics} /> : null}
        <CustomAgentsBadges templateIds={templateIds} className="mt-3" compact />
      </div>

      <div className="grid gap-0 lg:grid-cols-2 lg:divide-x divide-border/50">
        <div className="p-4 space-y-4 min-w-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              {TASK_LIVE_RUN.taskPrompt}
            </p>
            <p className="text-sm font-medium text-foreground leading-snug">{title}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md border border-border/50 bg-background/50 px-2 py-1.5">
              <dt className="text-muted-foreground">{TASK_LIVE_RUN.execution}</dt>
              <dd className="font-mono text-foreground mt-0.5">{TASK_LIVE_RUN.executionValue}</dd>
            </div>
            <div className="rounded-md border border-border/50 bg-background/50 px-2 py-1.5">
              <dt className="text-muted-foreground">
                {task.sdlc_phase ? TASK_LIVE_RUN.workstream : "Scope"}
              </dt>
              <dd className="text-foreground mt-0.5 font-medium">{workstreamLabel}</dd>
            </div>
          </dl>
          {task.product_id ? (
            <div className="rounded-md border border-border/40 bg-muted/20 px-2 py-1.5 text-[11px] font-mono text-muted-foreground">
              {task.product_id}
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {TASK_LIVE_RUN.aboutRun}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{TASK_LIVE_RUN.aboutRunBody}</p>
          </div>
        </div>

        <div className="p-4 flex flex-col min-h-[200px] lg:min-h-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {TASK_LIVE_RUN.pipelineStages}
          </p>
          <ul className="space-y-1.5 mb-4 shrink-0">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-xs">
                <MilestoneIcon status={m.status} />
                <span
                  className={cn(
                    m.status === "running" && "text-amber-600 dark:text-amber-400 font-medium",
                    m.status === "done" && "text-foreground",
                    m.status === "waiting" && "text-muted-foreground"
                  )}
                >
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {TASK_LIVE_RUN.eventStream}
          </p>
          <div className="flex-1 min-h-[120px] max-h-52 overflow-y-auto rounded-md border border-border/50 bg-background/40 px-2 py-2 space-y-1.5">
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                {isActive ? TASK_LIVE_RUN.eventStreamWaiting : TASK_LIVE_RUN.eventStreamEmpty}
              </p>
            ) : (
              logs.map((entry) => <LogLine key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-muted/10 px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {TASK_LIVE_RUN.assistantActivity}
          </p>
          {activeWorker ? (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {formatLiveTimeAgo(activeWorker.at)}
            </span>
          ) : null}
        </div>
        <div className="max-h-40 overflow-y-auto space-y-2 font-mono">
          {actions.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              {TASK_LIVE_RUN.assistantActivityEmpty}
            </p>
          ) : (
            actions.slice(-12).map((action) => <WorkerLine key={action.id} action={action} />)
          )}
        </div>
      </div>
    </Card>
  )
}
