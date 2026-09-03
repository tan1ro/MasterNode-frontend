"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  Layers,
  Loader2,
  Merge,
  Radio,
  ShieldCheck,
} from "lucide-react"
import { pipelineStageLabel } from "@/constants/pipeline-template-roles"
import { TASK_LIVE_RUN } from "@/constants/task-live-run"
import {
  planTodoCounts,
  type ParsedPlanTodo,
  type PlanTodoStatus,
} from "@/lib/pipeline-plan-parse"
import type { TaskMilestoneRow } from "@/lib/task-live-execution"
import { renderInlineMarkdown } from "@/lib/inline-markdown"
import {
  isPostParallelStage,
  normalizePipelineStageKey,
  PIPELINE_THINKING_STAGE,
  pipelineStageActivity,
  reworkStepsForStage,
} from "@/lib/pipeline-stage-activity"
import { useLiveThinkingSteps } from "@/lib/pipeline-thinking-live"
import { cn } from "@/lib/utils"

export type PipelinePanelTone = "thinking" | "running" | "complete" | "review" | "idle" | "error"

const TONE_BORDER: Record<PipelinePanelTone, string> = {
  thinking: "border-violet-500/35",
  review: "border-violet-500/35",
  running: "border-amber-500/40",
  complete: "border-emerald-500/35",
  idle: "border-border/60",
  error: "border-destructive/40",
}

export function PipelinePanelShell({
  tone,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  tone: PipelinePanelTone
  children: ReactNode
  className?: string
  "aria-label"?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-[#0c0e14] text-left text-foreground shadow-lg dark:bg-[#0c0e14]",
        TONE_BORDER[tone],
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}

export function PipelinePanelHeader({
  tone,
  title,
  subtitle,
  statusLabel,
  streamLabel,
  streamLive,
  metaLabel,
  expanded,
  onToggleExpanded,
  onDismiss,
}: {
  tone: PipelinePanelTone
  title: string
  subtitle: string
  statusLabel: string
  streamLabel?: string | null
  streamLive?: boolean
  metaLabel?: string | null
  expanded?: boolean
  onToggleExpanded?: () => void
  onDismiss?: () => void
}) {
  const thinking = tone === "thinking" || tone === "review"
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 sm:px-5",
        expanded !== false && "border-b border-white/8"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-tight text-white">{title}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-white/45">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            thinking && "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
            tone === "running" && "bg-amber-500 text-amber-950",
            tone === "complete" && "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
            tone === "error" && "bg-destructive/15 text-destructive",
            tone === "idle" && "bg-white/8 text-white/60"
          )}
        >
          {thinking ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
          ) : null}
          {statusLabel}
        </span>
        {streamLabel ? (
          <span className="hidden items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/55 sm:inline-flex">
            <Radio
              className={cn(
                "h-3 w-3",
                streamLive ? "animate-pulse text-emerald-400" : "text-white/40"
              )}
            />
            {streamLabel}
          </span>
        ) : null}
        {metaLabel ? (
          <span className="hidden items-center gap-1 text-[11px] text-white/40 sm:inline-flex">
            <Clock className="h-3 w-3" aria-hidden />
            {metaLabel}
          </span>
        ) : null}
        {onToggleExpanded ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-md p-1 text-white/40 hover:bg-white/5 hover:text-white/70"
            aria-expanded={expanded !== false}
            aria-label={expanded !== false ? "Collapse pipeline details" : "Expand pipeline details"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded !== false ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="px-1.5 text-[10px] font-medium text-white/40 hover:text-white/70"
          >
            Hide
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Body that collapses to a one-line brief when the header chevron is closed. */
export function PipelinePanelCollapsibleBody({
  expanded,
  brief,
  children,
  className,
}: {
  expanded: boolean
  /** Short summary shown while collapsed (status / stage / elapsed). */
  brief: ReactNode
  children: ReactNode
  className?: string
}) {
  if (!expanded) {
    return (
      <div className="border-t border-white/8 px-4 py-2.5 sm:px-5">
        <p className="truncate text-[12px] leading-snug text-white/50">{brief}</p>
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

export interface TimelineStep {
  id: string
  title: string
  detail?: string
  status: PlanTodoStatus
  durationLabel?: string | null
}

function TimelineNode({ status, accent }: { status: PlanTodoStatus; accent: "violet" | "amber" }) {
  if (status === "completed") {
    return (
      <span className="relative z-[1] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      </span>
    )
  }
  if (status === "in_progress") {
    return (
      <span
        className={cn(
          "relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border-2",
          accent === "violet"
            ? "border-violet-400 text-violet-300"
            : "border-amber-400 text-amber-300"
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      </span>
    )
  }
  return (
    <span
      className={cn(
        "relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-[#0c0e14]",
        accent === "violet" ? "border-violet-500/40" : "border-white/20"
      )}
    >
      <Circle className="h-2 w-2 text-transparent" aria-hidden />
    </span>
  )
}

/** Vertical dashed timeline checklist (thinking / stage steps). */
export function PipelineTimelineChecklist({
  steps,
  accent = "violet",
  className,
}: {
  steps: TimelineStep[]
  accent?: "violet" | "amber"
  className?: string
}) {
  return (
    <ol className={cn("relative space-y-0", className)} aria-label="Stage steps">
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        const active = step.status === "in_progress"
        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!last ? (
              <span
                className={cn(
                  "absolute left-[11px] top-6 bottom-0 w-px border-l border-dashed",
                  accent === "violet" ? "border-violet-500/35" : "border-white/15"
                )}
                aria-hidden
              />
            ) : null}
            <TimelineNode status={step.status} accent={accent} />
            <div
              className={cn(
                "min-w-0 flex-1 rounded-xl px-2.5 py-2",
                active &&
                  (accent === "violet"
                    ? "bg-violet-500/10 ring-1 ring-violet-500/25"
                    : "bg-amber-500/10 ring-1 ring-amber-500/25")
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-medium leading-snug",
                      step.status === "completed" && "text-white/55",
                      active && "text-white",
                      step.status === "pending" && "text-white/70"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.detail ? (
                    <p className="mt-0.5 text-[11px] leading-snug text-white/40">{step.detail}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 pt-0.5 font-mono text-[11px] tabular-nums",
                    active
                      ? accent === "violet"
                        ? "text-violet-300"
                        : "text-amber-300"
                      : step.status === "completed"
                        ? "text-white/45"
                        : "text-white/30"
                  )}
                  aria-live={active ? "polite" : undefined}
                >
                  {step.durationLabel?.trim() || "—"}
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function PipelineStageProgressCard({
  done,
  total,
  etaLabel,
  accent = "violet",
  className,
}: {
  done: number
  total: number
  etaLabel?: string | null
  accent?: "violet" | "amber"
  className?: string
}) {
  const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : 0
  return (
    <div className={cn("rounded-xl border border-white/8 bg-[#12151c] p-3.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
          Stage progress
        </p>
        <p className="text-[12px] font-semibold tabular-nums text-white">
          {Math.min(done, total)} / {total}{" "}
          <span className="font-medium text-white/45">steps</span>
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span className="font-semibold tabular-nums text-white">{pct}%</span>
        {etaLabel ? (
          <span className="text-white/45">
            Est.{" "}
            <span
              className={cn(
                "font-medium",
                accent === "violet" ? "text-violet-300" : "text-amber-300"
              )}
            >
              {etaLabel}
            </span>
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            accent === "violet" ? "bg-violet-500" : "bg-amber-500"
          )}
          style={{ width: `${Math.max(pct, done === 0 ? 8 : pct)}%` }}
        />
      </div>
    </div>
  )
}

export function PipelineThinkingLayout({
  stageNumber = 1,
  stageTitle,
  stageDescription,
  stageEta,
  stageElapsed,
  steps,
  aboutText,
  moduleCount,
  avgDurationLabel,
  footer,
  className,
}: {
  stageNumber?: number
  stageTitle: string
  stageDescription: string
  stageEta?: string | null
  /** Live elapsed for the whole stage (counts up). */
  stageElapsed?: string | null
  steps: TimelineStep[]
  aboutText: string
  moduleCount: number
  avgDurationLabel: string
  footer?: ReactNode
  className?: string
}) {
  const done = steps.filter((s) => s.status === "completed").length
  const total = steps.length
  const inProgress = steps.some((s) => s.status === "in_progress")
  const remainingSteps = Math.max(0, total - done - (inProgress ? 1 : 0))
  const etaFromSteps =
    stageEta ||
    (remainingSteps > 0 || inProgress ? `~ ${Math.max(3, (remainingSteps + (inProgress ? 1 : 0)) * 4)}s` : "~ 0s")

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-white/8 bg-[#12151c] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-sm font-bold text-violet-300">
            {stageNumber}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-white">{stageTitle}</p>
                <p className="mt-0.5 text-[12px] text-white/45">{stageDescription}</p>
              </div>
              <div className="shrink-0 text-right">
                {stageElapsed ? (
                  <p className="font-mono text-[12px] font-medium tabular-nums text-violet-300" aria-live="polite">
                    {stageElapsed}
                  </p>
                ) : null}
                {stageEta || etaFromSteps ? (
                  <p className="text-[11px] text-white/40">
                    Est. {stageEta || etaFromSteps}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.9fr)]">
          <PipelineTimelineChecklist steps={steps} accent="violet" />

          <div className="space-y-3">
            <PipelineStageProgressCard
              done={done}
              total={total}
              etaLabel={etaFromSteps}
              accent="violet"
            />
            <div className="rounded-xl border border-white/8 bg-[#0c0e14] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                About this stage
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/55">{aboutText}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/8 bg-[#12151c] px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <Layers className="h-3 w-3" aria-hidden />
                    Modules
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    {moduleCount}{" "}
                    <span className="text-[11px] font-normal text-white/40">To be executed</span>
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#12151c] px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <Clock className="h-3 w-3" aria-hidden />
                    Avg. duration
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    {avgDurationLabel}{" "}
                    <span className="text-[11px] font-normal text-white/40">For this stage</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {footer}
    </div>
  )
}

export function PipelineModuleCards({
  modules,
  className,
}: {
  modules: string[]
  className?: string
}) {
  if (modules.length === 0) return null
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Modules
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {modules.map((mod) => (
          <li
            key={mod}
            className="rounded-xl border border-white/8 bg-[#12151c] px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
              <span className="truncate text-[12px] font-medium text-white">
                {pipelineStageLabel(mod.toLowerCase()) || mod}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-400">Active</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PipelineExecutingProgress({
  done,
  total,
  elapsedLabel,
  metricsLine,
  currentStep,
  className,
}: {
  done: number
  total: number
  elapsedLabel?: string | null
  metricsLine?: ReactNode
  currentStep?: string | null
  className?: string
}) {
  const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : 0
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-xl font-semibold tabular-nums tracking-tight text-white">
          {Math.min(done, total)}
          <span className="text-white/40">/{total}</span>
          <span className="ml-1.5 text-xs font-medium text-white/45">stages</span>
        </p>
        {elapsedLabel ? (
          <p className="pb-0.5 text-[12px] text-white/45">
            {TASK_LIVE_RUN.metrics.elapsed}{" "}
            <span className="font-semibold text-amber-300">{elapsedLabel}</span>
          </p>
        ) : null}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${Math.max(pct, done === 0 ? 12 : pct)}%` }}
        />
      </div>
      {metricsLine ? (
        <p className="text-[11px] text-white/40">{metricsLine}</p>
      ) : null}
      {currentStep ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Current step
          </p>
          <p className="rounded-lg border border-white/8 bg-[#12151c] px-3 py-2 font-mono text-[12px] text-amber-300">
            <span className="text-white/35">&gt;_ step </span>
            {currentStep}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function stageToTodo(stage: TaskMilestoneRow): ParsedPlanTodo {
  return {
    id: stage.id,
    content: stage.label,
    status:
      stage.status === "done"
        ? "completed"
        : stage.status === "running"
          ? "in_progress"
          : "pending",
  }
}

function checklistStageKey(todo: ParsedPlanTodo): string {
  const fromId = normalizePipelineStageKey(todo.id)
  if (fromId) return fromId
  const content = todo.content.toLowerCase()
  if (content.includes("aggregat")) return "aggregator"
  if (content.includes("supervis")) return "supervisor"
  if (content.includes("parallel")) return "parallel"
  if (content.includes("decompos")) return "decomposer"
  if (content.includes("master")) return "master"
  return ""
}

export function PipelineExecutionChecklist({
  todos,
  stages = [],
  parallelSummary = null,
  className,
}: {
  todos?: ParsedPlanTodo[]
  stages?: TaskMilestoneRow[]
  parallelSummary?: { completed: number; total: number; running: number } | null
  className?: string
}) {
  const items =
    todos && todos.length > 0
      ? todos.filter((todo) => todo.status !== "cancelled")
      : stages.map(stageToTodo)

  if (items.length === 0) return null

  const counts = planTodoCounts(items)
  const header =
    counts.remaining > 0
      ? `${counts.remaining} remaining · ${counts.completed} done`
      : counts.completed > 0
        ? `All ${counts.completed} complete`
        : "Checklist"

  return (
    <div
      className={cn("rounded-xl border border-white/8 bg-[#12151c] px-3.5 py-3", className)}
      aria-label="Pipeline checklist"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Checklist
        </p>
        <p className="text-[11px] tabular-nums text-white/40">{header}</p>
      </div>
      <ul className="space-y-1">
        {items.map((todo) => {
          const stageKey = checklistStageKey(todo)
          const activity = pipelineStageActivity(stageKey)
          const isParallel = stageKey === "parallel"
          const showWorkers =
            isParallel && parallelSummary && parallelSummary.total > 0
          const active = todo.status === "in_progress"
          const postParallelHint =
            active && isPostParallelStage(stageKey) ? activity?.rework || activity?.detail : null

          return (
            <li
              key={todo.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg px-2 py-2 text-[12px] leading-snug transition-colors",
                active &&
                  (stageKey === "aggregator"
                    ? "bg-violet-500/10 ring-1 ring-violet-500/25"
                    : stageKey === "supervisor"
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/25"
                      : "bg-amber-500/10 ring-1 ring-amber-500/25")
              )}
            >
              <span className="mt-0.5">
                {todo.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                ) : active ? (
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border-2",
                      stageKey === "aggregator"
                        ? "border-violet-400 text-violet-300"
                        : stageKey === "supervisor"
                          ? "border-emerald-400 text-emerald-300"
                          : "border-amber-400 text-amber-300"
                    )}
                  >
                    <ChevronRight className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <Circle className="h-4 w-4 text-white/25" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block",
                    todo.status === "completed" && "text-white/40 line-through",
                    active && "font-medium text-white",
                    todo.status === "pending" && "text-white/65"
                  )}
                >
                  {renderInlineMarkdown(todo.content)}
                </span>
                {showWorkers ? (
                  <span className="mt-0.5 block text-[10px] tabular-nums text-white/40">
                    Workers {parallelSummary.completed}/{parallelSummary.total}
                    {parallelSummary.running > 0
                      ? ` · ${parallelSummary.running} active`
                      : ""}
                  </span>
                ) : null}
                {postParallelHint ? (
                  <span className="mt-0.5 block text-[10px] leading-snug text-white/45">
                    {postParallelHint}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Distinct post-parallel card for Aggregator vs Supervisor while they rework the task. */
export function PipelinePostParallelActivity({
  stageKey,
  status = "running",
  className,
}: {
  stageKey: string
  status?: "running" | "done"
  className?: string
}) {
  const key = normalizePipelineStageKey(stageKey)
  const activity = isPostParallelStage(key) ? pipelineStageActivity(key) : null
  const isAggregator = key === "aggregator"
  const Icon = isAggregator ? Merge : ShieldCheck
  const done = status === "done"
  const reworkBase = reworkStepsForStage(key) ?? []
  const [reworkTick, setReworkTick] = useState(0)

  useEffect(() => {
    if (!activity) return
    if (done) {
      setReworkTick(reworkBase.length)
      return
    }
    setReworkTick(0)
    const id = window.setInterval(() => {
      setReworkTick((prev) => Math.min(prev + 1, Math.max(0, reworkBase.length - 1)))
    }, 2800)
    return () => window.clearInterval(id)
  }, [activity, done, key, reworkBase.length])

  if (!activity) return null

  const reworkSteps: TimelineStep[] = reworkBase.map((step, index) => {
    const statusStep =
      done || index < reworkTick
        ? ("completed" as const)
        : index === reworkTick
          ? ("in_progress" as const)
          : ("pending" as const)
    return {
      id: step.id,
      title: step.title,
      detail: step.detail,
      status: statusStep,
      durationLabel:
        statusStep === "pending" ? "—" : statusStep === "in_progress" ? "live" : "done",
    }
  })

  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3 space-y-3",
        isAggregator
          ? "border-violet-500/35 bg-violet-500/8"
          : "border-emerald-500/35 bg-emerald-500/8",
        className
      )}
      aria-label={activity.headline}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            isAggregator
              ? "bg-violet-500/20 text-violet-300"
              : "bg-emerald-500/20 text-emerald-300"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-white">{activity.headline}</p>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                done
                  ? "bg-emerald-500/15 text-emerald-300"
                  : isAggregator
                    ? "bg-violet-500/20 text-violet-200"
                    : "bg-emerald-500/20 text-emerald-200"
              )}
            >
              {done ? "Done" : "Reworking"}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-white/55">{activity.detail}</p>
          {activity.rework ? (
            <p
              className={cn(
                "mt-2 border-l-2 pl-2.5 text-[11px] leading-relaxed",
                isAggregator
                  ? "border-violet-400/50 text-violet-100/70"
                  : "border-emerald-400/50 text-emerald-100/70"
              )}
            >
              {activity.rework}
            </p>
          ) : null}
        </div>
      </div>

      {reworkSteps.length > 0 ? (
        <div className="rounded-lg border border-white/8 bg-[#0c0e14]/80 px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Rework checklist
            </p>
            <p className="text-[11px] tabular-nums text-white/40">
              {done
                ? `All ${reworkSteps.length} complete`
                : `${Math.min(reworkTick, reworkSteps.length)} / ${reworkSteps.length} steps`}
            </p>
          </div>
          <PipelineTimelineChecklist
            steps={reworkSteps}
            accent={isAggregator ? "violet" : "amber"}
          />
        </div>
      ) : null}
    </div>
  )
}

export function PipelineRunDetailsCard({
  taskId,
  taskPrompt,
  statusLabel,
  streamLabel,
  streamLive = false,
  elapsedLabel,
  stagesLabel,
  agentsLabel,
  outputFormatLabel,
  workstreamLabel,
  className,
}: {
  taskId: string
  /** Original user task / prompt for this run. */
  taskPrompt?: string | null
  statusLabel: string
  streamLabel?: string | null
  streamLive?: boolean
  elapsedLabel?: string | null
  stagesLabel?: string | null
  agentsLabel?: string | null
  outputFormatLabel?: string | null
  workstreamLabel?: string | null
  /** @deprecated Kept for callers; run details no longer link out from this card. */
  href?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(taskId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const rows: Array<{ label: string; value: ReactNode; mono?: boolean }> = [
    {
      label: "Task ID",
      mono: true,
      value: (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate">{taskId}</span>
          <button
            type="button"
            onClick={() => void copyId()}
            className="shrink-0 rounded p-0.5 text-white/35 hover:text-white/70"
            aria-label="Copy task id"
          >
            <Copy className="h-3 w-3" />
          </button>
          {copied ? <span className="shrink-0 text-[10px] text-emerald-400">Copied</span> : null}
        </span>
      ),
    },
    {
      label: TASK_LIVE_RUN.execution,
      mono: true,
      value: TASK_LIVE_RUN.executionValue,
    },
    {
      label: "Status",
      value: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
            {statusLabel}
          </span>
          {streamLabel ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/45">
              <Radio
                className={cn(
                  "h-3 w-3",
                  streamLive ? "animate-pulse text-emerald-400" : "text-white/35"
                )}
              />
              {streamLabel}
            </span>
          ) : null}
        </span>
      ),
    },
  ]

  if (elapsedLabel) {
    rows.push({ label: TASK_LIVE_RUN.metrics.elapsed, value: elapsedLabel })
  }
  if (stagesLabel) {
    rows.push({ label: "Stages", value: stagesLabel })
  }
  if (agentsLabel) {
    rows.push({ label: TASK_LIVE_RUN.metrics.agents, value: agentsLabel })
  }
  if (outputFormatLabel) {
    rows.push({ label: "Output", value: outputFormatLabel })
  }
  if (workstreamLabel) {
    rows.push({ label: TASK_LIVE_RUN.workstream, value: workstreamLabel })
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-xl border border-white/8 bg-[#12151c] p-3.5",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Run details
      </p>

      {taskPrompt?.trim() ? (
        <div className="mt-3 rounded-lg border border-white/8 bg-[#0c0e14] px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400/90">
            {TASK_LIVE_RUN.taskPrompt}
          </p>
          <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-white/80">
            {taskPrompt.trim()}
          </p>
        </div>
      ) : null}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-[12px]">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-white/40">{row.label}</dt>
            <dd
              className={cn(
                "mt-1 text-white/80",
                row.mono && "font-mono text-[11px]"
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        {TASK_LIVE_RUN.aboutRunBody}
      </p>
    </aside>
  )
}

/** @deprecated Prefer PipelineModuleCards — kept for chat graph callers. */
export function PipelineModulesRow({
  modules,
  className,
}: {
  modules: string[]
  className?: string
}) {
  return <PipelineModuleCards modules={modules} className={className} />
}

export function PipelineProgressMeter(props: {
  done: number
  total: number
  elapsed?: string
  currentStep?: string | null
  complete?: boolean
  extraMetrics?: ReactNode
  className?: string
}) {
  return (
    <PipelineExecutingProgress
      done={props.done}
      total={props.total}
      elapsedLabel={props.elapsed}
      currentStep={props.currentStep}
      metricsLine={props.extraMetrics}
      className={props.className}
    />
  )
}

export function PipelinePlanThinkingBody({
  steps,
  className,
}: {
  steps?: TimelineStep[]
  className?: string
}) {
  const live = useLiveThinkingSteps({ enabled: !steps })
  const resolved = steps ?? live.steps

  return (
    <PipelineThinkingLayout
      stageTitle={PIPELINE_THINKING_STAGE.title}
      stageDescription={PIPELINE_THINKING_STAGE.description}
      stageEta={steps ? PIPELINE_THINKING_STAGE.eta : live.remainingEtaLabel}
      stageElapsed={steps ? null : live.totalElapsedLabel}
      steps={resolved}
      aboutText={PIPELINE_THINKING_STAGE.about}
      moduleCount={3}
      avgDurationLabel={steps ? PIPELINE_THINKING_STAGE.avgDurationLabel : live.avgCompletedLabel}
      className={className}
    />
  )
}
