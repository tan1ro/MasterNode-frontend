"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  PipelineExecutionChecklist,
  PipelineExecutingProgress,
  PipelineModuleCards,
  PipelinePanelCollapsibleBody,
  PipelinePanelHeader,
  PipelinePanelShell,
  PipelinePostParallelActivity,
  PipelineRunDetailsCard,
  PipelineThinkingLayout,
  type PipelinePanelTone,
  type TimelineStep,
} from "@/components/pipeline/pipeline-panel-ui"
import { TASK_LIVE_RUN } from "@/constants/task-live-run"
import {
  buildDemoStages,
  HOME_CHAT_PIPELINE_PANEL_DEMO,
} from "@/constants/home-pipeline-demo"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { syncPlanTodosToStageProgress, type ParsedPlanTodo } from "@/lib/pipeline-plan-parse"
import { pipelinePlanOutputFormatLabel } from "@/lib/pipeline-plan-output-format"
import {
  PIPELINE_THINKING_STAGE,
} from "@/lib/pipeline-stage-activity"
import { useLiveThinkingSteps } from "@/lib/pipeline-thinking-live"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

type DemoPhase =
  | "creating_plan"
  | "executing_0"
  | "executing_1"
  | "executing_2"
  | "aggregating"
  | "supervising"
  | "complete"

const PHASE_ORDER: DemoPhase[] = [
  "creating_plan",
  "executing_0",
  "executing_1",
  "executing_2",
  "aggregating",
  "supervising",
  "complete",
]

const PHASE_MS: Record<DemoPhase, number> = {
  creating_plan: 7000,
  executing_0: 2800,
  executing_1: 2800,
  executing_2: 2800,
  aggregating: 3200,
  supervising: 3200,
  complete: 4500,
}

const REDUCED_MOTION_PHASE: DemoPhase = "executing_1"

/**
 * Homepage demo of the in-chat pipeline panel — matches the redesigned two-column UI.
 */
export function ChatPipelinePanelDemo({
  className,
  ctaHref = ROUTES.signUp,
}: {
  className?: string
  ctaHref?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<DemoPhase>(
    reducedMotion ? REDUCED_MOTION_PHASE : "creating_plan"
  )
  const [expanded, setExpanded] = useState(true)

  const demo = HOME_CHAT_PIPELINE_PANEL_DEMO
  const totalStages = demo.stageLabels.length
  const creatingPlan = phase === "creating_plan"
  const liveThinking = useLiveThinkingSteps({
    enabled: creatingPlan && !reducedMotion,
    stepDurationMs: 1600,
  })

  useEffect(() => {
    if (reducedMotion) return
    const delay = PHASE_MS[phase]
    const timer = window.setTimeout(() => {
      setPhase((current) => {
        const index = PHASE_ORDER.indexOf(current)
        return PHASE_ORDER[(index + 1) % PHASE_ORDER.length] ?? "creating_plan"
      })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [phase, reducedMotion])

  const complete = phase === "complete"
  const aggregating = phase === "aggregating"
  const supervising = phase === "supervising"
  const liveExecuting = !creatingPlan && !complete
  const postParallelKey = aggregating ? "aggregator" : supervising ? "supervisor" : null

  const activeStage =
    phase === "executing_0"
      ? 0
      : phase === "executing_1"
        ? 1
        : phase === "executing_2"
          ? 2
          : aggregating || supervising || complete
            ? totalStages
            : 0

  const progressDone =
    complete || aggregating || supervising ? totalStages : Math.max(0, activeStage)
  const stages = useMemo(
    () => buildDemoStages(activeStage, complete || aggregating || supervising),
    [activeStage, complete, aggregating, supervising]
  )
  const executionTodos = useMemo((): ParsedPlanTodo[] => {
    const base = demo.todos.map((todo) => ({
      id: todo.id,
      content: todo.content,
      status: "pending" as const,
    }))
    return syncPlanTodosToStageProgress(base, progressDone, {
      allDone: complete,
      isActive: liveExecuting && !postParallelKey,
    })
  }, [demo.todos, progressDone, complete, liveExecuting, postParallelKey])

  const currentStep = complete
    ? null
    : postParallelKey
      ? postParallelKey === "supervisor"
        ? "supervise_and_rework_deliverable"
        : "aggregate_parallel_outputs"
      : demo.pipelineSteps[Math.min(activeStage, demo.pipelineSteps.length - 1)]
  const elapsed =
    demo.elapsedByPhase[
      phase === "creating_plan"
        ? 0
        : phase === "executing_0"
          ? 1
          : phase === "executing_1"
            ? 2
            : phase === "executing_2"
              ? 3
              : phase === "aggregating"
                ? 4
                : 4
    ]

  const parallelSummary = {
    completed: aggregating || supervising || complete ? 3 : Math.min(activeStage, 3),
    total: 3,
    running: liveExecuting && !postParallelKey ? 1 : 0,
  }

  const thinkingSteps: TimelineStep[] = liveThinking.steps

  const tone: PipelinePanelTone = creatingPlan
    ? "thinking"
    : complete
      ? "complete"
      : "running"

  const panelTitle = creatingPlan
    ? "Pipeline Run"
    : complete
      ? "Pipeline complete"
      : supervising
        ? "Supervisor · Reworking result"
        : aggregating
          ? "Aggregator · Merging parallel work"
          : "Pipeline mode · Executing"

  const panelStatusLabel = creatingPlan
    ? "THINKING"
    : complete
      ? "COMPLETE"
      : supervising
        ? "SUPERVISING"
        : aggregating
          ? "AGGREGATING"
          : "RUNNING"

  const collapsedBrief = creatingPlan
    ? `Stage 1 · Master & Decompose · Creating plan… · Just now`
    : complete
      ? `Pipeline complete · ${progressDone}/${totalStages} stages`
      : postParallelKey
        ? `${postParallelKey === "supervisor" ? "Supervisor" : "Aggregator"} · reworking · ${elapsed}`
        : `Executing · ${progressDone}/${totalStages} stages · ${elapsed}`

  return (
    <PipelinePanelShell
      tone={tone}
      className={cn("chat-pipeline-panel-demo", className)}
      aria-label="Pipeline mode preview"
    >
      <PipelinePanelHeader
        tone={tone}
        title={panelTitle}
        subtitle={demo.taskId}
        statusLabel={panelStatusLabel}
        streamLabel={
          creatingPlan
            ? null
            : complete
              ? TASK_LIVE_RUN.streamSynced
              : TASK_LIVE_RUN.streamLive
        }
        streamLive={!creatingPlan && !complete}
        metaLabel={creatingPlan ? "Just now" : elapsed}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((value) => !value)}
      />

      <PipelinePanelCollapsibleBody
        expanded={expanded}
        brief={collapsedBrief}
        className="space-y-3 px-3.5 py-3.5 sm:px-4 sm:py-4"
      >
        {creatingPlan ? (
          <PipelineThinkingLayout
            stageTitle={PIPELINE_THINKING_STAGE.title}
            stageDescription={PIPELINE_THINKING_STAGE.description}
            stageEta={liveThinking.remainingEtaLabel}
            stageElapsed={liveThinking.totalElapsedLabel}
            steps={thinkingSteps}
            aboutText={PIPELINE_THINKING_STAGE.about}
            moduleCount={demo.modules.length}
            avgDurationLabel={liveThinking.avgCompletedLabel}
            footer={
              <div className="flex justify-end">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/35 px-3 py-2 text-[12px] font-medium text-violet-200 hover:bg-violet-500/10"
                >
                  View full run
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            }
          />
        ) : null}

        {liveExecuting || complete ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.88fr)]">
            <div className="min-w-0 space-y-3">
              <PipelineModuleCards modules={[...demo.modules]} />

              <PipelineExecutingProgress
                done={progressDone}
                total={totalStages}
                elapsedLabel={complete ? "0s" : elapsed}
                currentStep={currentStep}
                metricsLine={
                  <>
                    0/3 agents · Workers {parallelSummary.completed}/{parallelSummary.total}
                    {parallelSummary.running > 0
                      ? ` (${parallelSummary.running} active)`
                      : ""}
                  </>
                }
              />

              {postParallelKey ? (
                <>
                  <PipelinePostParallelActivity
                    stageKey={postParallelKey}
                    status={complete ? "done" : "running"}
                  />
                  <p className="text-[11px] text-white/40">
                    Build checklist complete · {executionTodos.length || demo.todos.length} steps
                    done
                  </p>
                </>
              ) : complete ? (
                <PipelinePostParallelActivity stageKey="supervisor" status="done" />
              ) : (
                <PipelineExecutionChecklist
                  todos={executionTodos}
                  stages={stages}
                  parallelSummary={parallelSummary}
                />
              )}
            </div>

            <PipelineRunDetailsCard
              taskId={demo.taskId}
              taskPrompt={demo.taskPrompt}
              statusLabel={
                complete
                  ? "Completed"
                  : supervising
                    ? "Supervising"
                    : aggregating
                      ? "Aggregating"
                      : "Running"
              }
              streamLabel={
                complete ? TASK_LIVE_RUN.streamSynced : TASK_LIVE_RUN.streamLive
              }
              streamLive={!complete}
              elapsedLabel={elapsed}
              stagesLabel={
                postParallelKey
                  ? postParallelKey === "supervisor"
                    ? "After Parallel · Supervisor"
                    : "After Parallel · Aggregator"
                  : `${progressDone}/${totalStages} ${TASK_LIVE_RUN.metrics.stagesProgress}`
              }
              agentsLabel={`${parallelSummary.completed}/${parallelSummary.total}`}
              outputFormatLabel={pipelinePlanOutputFormatLabel(demo.intentKind)}
              workstreamLabel={demo.workstreamLabel}
              href={ctaHref}
            />
          </div>
        ) : null}

        {!creatingPlan ? (
          <div className="flex justify-end border-t border-white/8 pt-2.5">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 hover:underline"
            >
              Open full run
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        ) : null}
      </PipelinePanelCollapsibleBody>
    </PipelinePanelShell>
  )
}
