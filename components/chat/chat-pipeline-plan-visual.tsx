"use client"

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  FileText,
  Loader2,
} from "lucide-react"
import { ChatPipelineCodePlanVisual } from "@/components/chat/chat-pipeline-code-plan-visual"
import { isCodePipelinePlan } from "@/lib/pipeline-plan-code"
import {
  PIPELINE_PLAN_OUTPUT_FORMATS,
  pipelinePlanOutputFormatLabel,
  type PipelinePlanOutputFormat,
} from "@/lib/pipeline-plan-output-format"
import { cn } from "@/lib/utils"
import { renderInlineMarkdown } from "@/lib/inline-markdown"
import { looksLikeRawPlanDump } from "@/lib/pipeline-plan-normalize"
import {
  parsePipelinePlanMarkdown,
  planTodoCounts,
  visiblePlanTodos,
  type ParsedPlanTodo,
  type PlanTodoStatus,
} from "@/lib/pipeline-plan-parse"

export type PipelinePlanRunPhase = "review" | "building" | "done" | "idle"

export type PipelinePlanVisualSubtask = {
  name: string
  description?: string
  domain_assistant?: string | null
}

function TodoIcon({ status }: { status: PlanTodoStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
  }
  if (status === "in_progress") {
    return (
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 text-amber-500"
        aria-hidden
      >
        <ChevronRight className="h-2.5 w-2.5 stroke-[3]" />
      </span>
    )
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
}

function phaseLabel(phase: PipelinePlanRunPhase): string {
  if (phase === "review") return "Review"
  if (phase === "building") return "Building"
  if (phase === "done") return "Done"
  return "Plan"
}

export interface ChatPipelinePlanVisualProps {
  planMarkdown: string
  taskId?: string
  intentKind?: string
  modulesFromPayload?: string[]
  planSummary?: string
  plannedSubtasks?: PipelinePlanVisualSubtask[]
  estimatedAgentCount?: number
  runPhase?: PipelinePlanRunPhase
  onViewPlan?: () => void
  /** Button label for opening the plan markdown (e.g. Edit plan). */
  viewPlanLabel?: string
  onSavePlan?: () => void
  onIntentKindChange?: (kind: PipelinePlanOutputFormat) => void
  intentChangeDisabled?: boolean
  className?: string
}

export function ChatPipelinePlanVisual({
  planMarkdown,
  taskId,
  intentKind,
  modulesFromPayload,
  planSummary,
  plannedSubtasks,
  estimatedAgentCount,
  runPhase = "review",
  onViewPlan,
  viewPlanLabel = "View Plan",
  onSavePlan,
  onIntentKindChange,
  intentChangeDisabled,
  className,
}: ChatPipelinePlanVisualProps) {
  const parsed = parsePipelinePlanMarkdown(planMarkdown, {
    taskId,
    intentKind,
    modulesFromPayload,
  })
  const counts = planTodoCounts(parsed.todos)
  const visibleTodos = visiblePlanTodos(parsed.todos)
  const selectedKind = (intentKind || "text").toLowerCase()
  const canEditFormat = Boolean(onIntentKindChange) && runPhase === "review"
  const hasPlannedSubtasks = Boolean(plannedSubtasks && plannedSubtasks.length > 0)
  const showDetailSections =
    hasPlannedSubtasks ||
    Boolean(parsed.objective) ||
    parsed.outline.length > 0 ||
    parsed.requiredInputs.length > 0 ||
    parsed.modules.length > 0 ||
    parsed.deliverables.length > 0 ||
    parsed.clarificationUpdates.length > 0 ||
    parsed.yourChoices.length > 0
  const showEstimatedAgents =
    typeof estimatedAgentCount === "number" && estimatedAgentCount > 0

  if (isCodePipelinePlan(intentKind, parsed)) {
    return (
      <ChatPipelineCodePlanVisual
        planMarkdown={planMarkdown}
        taskId={taskId}
        intentKind={intentKind}
        modulesFromPayload={modulesFromPayload}
        runPhase={runPhase}
        onViewPlan={onViewPlan}
        viewPlanLabel={viewPlanLabel}
        onSavePlan={onSavePlan}
        onIntentKindChange={onIntentKindChange}
        intentChangeDisabled={intentChangeDisabled}
        className={className}
      />
    )
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-border/60 bg-[#1e1e1e] text-foreground shadow-md overflow-hidden",
        className
      )}
      aria-label={`Proposed plan: ${parsed.title}`}
    >
      <div className="px-4 pt-3.5 pb-2 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber/90">
          Proposed Plan
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate font-mono">{parsed.filename}</span>
        </div>

        <h3 className="text-[15px] font-semibold leading-snug tracking-tight">
          {renderInlineMarkdown(parsed.title)}
        </h3>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {renderInlineMarkdown(
            planSummary?.trim() && !looksLikeRawPlanDump(planSummary)
              ? planSummary.trim()
              : parsed.overview
          )}
        </p>
        {showEstimatedAgents ? (
          <p className="text-[11px] text-muted-foreground/90">
            Estimated parallel agents: {estimatedAgentCount}
          </p>
        ) : null}
      </div>

      {showDetailSections ? (
        <div className="mx-3 mb-3 rounded-lg border border-border/40 bg-black/20 px-3 py-2.5 space-y-2.5 text-[12px]">
          {hasPlannedSubtasks ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Planned subtasks
              </p>
              <ul className="space-y-1 text-foreground/90">
                {(plannedSubtasks || []).map((item) => (
                  <li key={item.name} className="leading-snug">
                    <span className="font-medium">{item.name}</span>
                    {item.domain_assistant ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.domain_assistant}
                      </span>
                    ) : null}
                    {item.description ? (
                      <span className="block text-muted-foreground text-[11px]">
                        {item.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.objective ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Objective
              </p>
              <p className="leading-snug">{parsed.objective}</p>
            </div>
          ) : null}
          {parsed.outline.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Outline
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
                {parsed.outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.clarificationUpdates.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber/80 mb-1">
                Clarification updates
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
                {parsed.clarificationUpdates.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.yourChoices.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber/80 mb-1">
                Your choices
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
                {parsed.yourChoices.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.requiredInputs.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Required inputs
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                {parsed.requiredInputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.modules.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Selected modules
              </p>
              <ul className="space-y-0.5">
                {parsed.modules.map((mod) => (
                  <li key={mod} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" aria-hidden />
                    {mod}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed.deliverables.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Expected deliverables
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                {parsed.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {visibleTodos.length > 0 ? (
        <div className="mx-3 mb-3 rounded-lg border border-border/40 bg-black/20 px-3 py-2.5 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            {counts.remaining} Remaining To-do{counts.remaining === 1 ? "" : "s"}
            {counts.completed > 0 ? ` (${counts.completed} Completed)` : ""}
          </p>
          <ul className="space-y-2">
            {visibleTodos.map((todo) => (
              <PlanTodoRow key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-2.5 bg-black/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onViewPlan}
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {viewPlanLabel}
          </button>
          {onSavePlan ? (
            <button
              type="button"
              onClick={onSavePlan}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3 w-3" aria-hidden />
              Download plan
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canEditFormat ? (
            <label className="relative inline-flex items-center">
              <span className="sr-only">Output format</span>
              <select
                value={selectedKind}
                disabled={intentChangeDisabled}
                onChange={(event) =>
                  onIntentKindChange?.(event.target.value as PipelinePlanOutputFormat)
                }
                className="appearance-none rounded-md border border-border/50 bg-muted/30 py-1 pl-2 pr-6 text-[11px] text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-amber/40 disabled:opacity-60"
                aria-label="Output format"
              >
                {PIPELINE_PLAN_OUTPUT_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-60"
                aria-hidden
              />
            </label>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
              {pipelinePlanOutputFormatLabel(selectedKind)}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
              runPhase === "building"
                ? "bg-amber/20 text-amber border border-amber/30"
                : runPhase === "review"
                  ? "bg-amber/15 text-amber border border-amber/25"
                  : "bg-muted/40 text-muted-foreground border border-border/50"
            )}
          >
            {runPhase === "building" ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            ) : null}
            {phaseLabel(runPhase)}
          </span>
        </div>
      </footer>
    </article>
  )
}

function PlanTodoRow({ todo }: { todo: ParsedPlanTodo }) {
  return (
    <li className="flex items-start gap-2.5 text-[12px] leading-snug">
      <span className="mt-0.5">
        <TodoIcon status={todo.status} />
      </span>
      <span
        className={cn(
          "min-w-0",
          todo.status === "completed" && "text-muted-foreground line-through",
          todo.status === "in_progress" && "text-foreground",
          todo.status === "pending" && "text-muted-foreground"
        )}
      >
        {renderInlineMarkdown(todo.content)}
      </span>
    </li>
  )
}
