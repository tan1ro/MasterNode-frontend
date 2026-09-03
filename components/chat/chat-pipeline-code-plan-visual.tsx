"use client"

import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Code2,
  Download,
  FileCode2,
  FolderOpen,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { renderInlineMarkdown } from "@/lib/inline-markdown"
import {
  fileIconTone,
  inferProjectFolderName,
  parseDeliverableFileTree,
  type PlanFileTreeNode,
} from "@/lib/pipeline-plan-code"
import {
  PIPELINE_PLAN_OUTPUT_FORMATS,
  pipelinePlanOutputFormatLabel,
  type PipelinePlanOutputFormat,
} from "@/lib/pipeline-plan-output-format"
import {
  parsePipelinePlanMarkdown,
  planTodoCounts,
  visiblePlanTodos,
  type ParsedPlanTodo,
  type PlanTodoStatus,
} from "@/lib/pipeline-plan-parse"
import type { PipelinePlanRunPhase } from "@/components/chat/chat-pipeline-plan-visual"

function TodoIcon({ status }: { status: PlanTodoStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
  }
  if (status === "in_progress") {
    return (
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-sky-500 text-sky-500"
        aria-hidden
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
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

function FileTreeRow({ node }: { node: PlanFileTreeNode }) {
  const tone = fileIconTone(node.extension)
  return (
    <li className="flex items-center gap-2 font-mono text-[11px] leading-none">
      {node.kind === "folder" ? (
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500/80" aria-hidden />
      ) : (
        <FileCode2 className={cn("h-3.5 w-3.5 shrink-0", tone)} aria-hidden />
      )}
      <span className="text-muted-foreground/70">{node.path.includes("/") ? node.path.split("/").slice(0, -1).join("/") + "/" : ""}</span>
      <span className={node.kind === "folder" ? "text-amber-100/90" : "text-foreground/90"}>
        {node.name}
      </span>
    </li>
  )
}

function BuildStepRow({ todo }: { todo: ParsedPlanTodo }) {
  return (
    <li className="flex items-start gap-2.5 text-[12px] leading-snug">
      <span className="mt-0.5">
        <TodoIcon status={todo.status} />
      </span>
      <span
        className={cn(
          "min-w-0",
          todo.status === "completed" && "text-muted-foreground line-through",
          todo.status === "in_progress" && "text-foreground font-medium",
          todo.status === "pending" && "text-muted-foreground"
        )}
      >
        {renderInlineMarkdown(todo.content)}
      </span>
    </li>
  )
}

export interface ChatPipelineCodePlanVisualProps {
  planMarkdown: string
  taskId?: string
  intentKind?: string
  modulesFromPayload?: string[]
  runPhase?: PipelinePlanRunPhase
  onViewPlan?: () => void
  viewPlanLabel?: string
  onSavePlan?: () => void
  onIntentKindChange?: (kind: PipelinePlanOutputFormat) => void
  intentChangeDisabled?: boolean
  className?: string
}

export function ChatPipelineCodePlanVisual({
  planMarkdown,
  taskId,
  intentKind,
  modulesFromPayload,
  runPhase = "review",
  onViewPlan,
  viewPlanLabel = "View raw plan",
  onSavePlan,
  onIntentKindChange,
  intentChangeDisabled,
  className,
}: ChatPipelineCodePlanVisualProps) {
  const parsed = parsePipelinePlanMarkdown(planMarkdown, {
    taskId,
    intentKind,
    modulesFromPayload,
  })
  const counts = planTodoCounts(parsed.todos)
  const visibleTodos = visiblePlanTodos(parsed.todos)
  const projectFolder = inferProjectFolderName(parsed.title, taskId)
  const fileTree = parseDeliverableFileTree(parsed.deliverables)
  const selectedKind = (intentKind || "code").toLowerCase()
  const canEditFormat = Boolean(onIntentKindChange) && runPhase === "review"

  return (
    <article
      className={cn(
        "rounded-xl border border-sky-500/25 bg-gradient-to-b from-[#0d1117] to-[#161b22] text-foreground shadow-md overflow-hidden",
        className
      )}
      aria-label={`Code build plan: ${parsed.title}`}
    >
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-2 border-b border-white/5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-500/30">
          <Code2 className="h-4 w-4 text-sky-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">
              Frontend build plan
            </p>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/25">
              Code
            </span>
          </div>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight">{parsed.title}</h3>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            {renderInlineMarkdown(parsed.overview)}
          </p>
        </div>
      </div>

      {parsed.objective ? (
        <div className="mx-3 mt-3 rounded-lg border border-white/8 bg-black/25 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Build objective
          </p>
          <p className="text-[12px] leading-snug">{renderInlineMarkdown(parsed.objective)}</p>
        </div>
      ) : null}

      {fileTree.length > 0 ? (
        <div className="mx-3 mt-3 rounded-lg border border-white/8 bg-[#0d1117] px-3 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Project scaffold
            </p>
            <span className="font-mono text-[10px] text-sky-400/80">{projectFolder}/</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {fileTree.map((node) => (
              <FileTreeRow key={node.path} node={node} />
            ))}
          </ul>
        </div>
      ) : parsed.deliverables.length > 0 ? (
        <div className="mx-3 mt-3 rounded-lg border border-white/8 bg-black/25 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Expected outputs
          </p>
          <ul className="space-y-1 text-[12px] text-muted-foreground font-mono">
            {parsed.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-sky-400 mt-0.5" aria-hidden />
                <span className="min-w-0 break-all">{item.replace(/^-\s+/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {parsed.requiredInputs.length > 0 ? (
        <div className="mx-3 mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600/90 dark:text-amber-400 mb-1.5">
            Prerequisites
          </p>
          <ul className="space-y-1 text-[12px] text-muted-foreground">
            {parsed.requiredInputs.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/70" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {visibleTodos.length > 0 ? (
        <div className="mx-3 mt-3 mb-3 rounded-lg border border-white/8 bg-black/25 px-3 py-2.5 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            {counts.remaining} build step{counts.remaining === 1 ? "" : "s"} remaining
            {counts.completed > 0 ? ` · ${counts.completed} done` : ""}
          </p>
          <ul className="space-y-2">
            {visibleTodos.map((todo) => (
              <BuildStepRow key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-white/8 px-4 py-2.5 bg-black/20">
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
                className="appearance-none rounded-md border border-sky-500/25 bg-sky-500/10 py-1 pl-2 pr-6 text-[11px] text-sky-300 hover:text-sky-100 focus:outline-none focus:ring-1 focus:ring-sky-500/40 disabled:opacity-60"
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
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-300">
              {pipelinePlanOutputFormatLabel(selectedKind)}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
              runPhase === "building"
                ? "bg-sky-500/20 text-sky-200 border border-sky-500/30"
                : runPhase === "review"
                  ? "bg-violet-500/15 text-violet-200 border border-violet-500/25"
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
