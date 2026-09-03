"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { pipelineStageLabel } from "@/constants/pipeline-template-roles"
import { TASK_LIVE_RUN } from "@/constants/task-live-run"
import { useTask } from "@/hooks/use-tasks"
import { useTaskLiveExecution } from "@/hooks/use-task-live-execution"
import { useWebSocket } from "@/hooks/use-websocket"
import { getPipelineDisplayMilestones } from "@/lib/task-live-execution"
import { taskDetailHref } from "@/lib/task-chat-link"
import {
  extractPipelinePlanFromTask,
  isPlanReviewPhase,
  isTerminalTaskStatus,
  taskHasApprovedPlanExecution,
  taskRequiresPlanApproval,
} from "@/lib/pipeline-plan"
import { ChatPipelinePlanCard } from "@/components/chat/chat-pipeline-plan-card"
import { ChatPipelinePlanAnswersSummary } from "@/components/chat/chat-pipeline-plan-answers-summary"
import {
  PipelineExecutionChecklist,
  PipelineExecutingProgress,
  PipelineModuleCards,
  PipelinePanelCollapsibleBody,
  PipelinePanelHeader,
  PipelinePanelShell,
  PipelinePlanThinkingBody,
  PipelinePostParallelActivity,
  PipelineRunDetailsCard,
  type PipelinePanelTone,
} from "@/components/pipeline/pipeline-panel-ui"
import {
  parsePipelinePlanMarkdown,
  syncPlanTodosToStageProgress,
} from "@/lib/pipeline-plan-parse"
import { isCodePipelinePlan } from "@/lib/pipeline-plan-code"
import { pipelinePlanOutputFormatLabel } from "@/lib/pipeline-plan-output-format"
import {
  isPostParallelStage,
  normalizePipelineStageKey,
} from "@/lib/pipeline-stage-activity"
import { TASK_STATUS_LABELS } from "@/lib/task-status-display"
import { useQueryClient } from "@tanstack/react-query"
import type { Task } from "@/types/api"

function formatStageId(raw: string): string {
  const key = raw.replace(/^pipeline:/, "").trim()
  return pipelineStageLabel(key) || key
}

export interface ChatPipelinePanelProps {
  taskId: string
  conversationId?: string | null
  onExecutionStarted?: (taskId: string) => void
  onCompleted?: (taskId: string, taskSnapshot?: Task) => void
  onFailed?: (taskId: string, error?: string) => void
  onDismiss?: () => void
  className?: string
}

export function ChatPipelinePanel({
  taskId,
  conversationId = null,
  onExecutionStarted,
  onCompleted,
  onFailed,
  onDismiss,
  className,
}: ChatPipelinePanelProps) {
  const terminalFiredRef = useRef<string | null>(null)
  const queryClient = useQueryClient()
  const { data: task, isFetching } = useTask(taskId, Boolean(taskId))
  const [expanded, setExpanded] = useState(true)
  const [executionStartedLocal, setExecutionStartedLocal] = useState(false)
  const planReview = isPlanReviewPhase(task) && !executionStartedLocal
  const prematureExecution =
    Boolean(task) &&
    taskRequiresPlanApproval(task) &&
    !taskHasApprovedPlanExecution(task) &&
    String(task?.status || "").toLowerCase() === "running"
  const pipelinePlanSnapshotKey = useMemo(() => {
    const raw = task?.pipeline_plan
    if (!raw || typeof raw !== "object") return task?.task_id ?? ""
    const plan = raw as Record<string, unknown>
    return JSON.stringify({
      taskId: task?.task_id,
      status: task?.status,
      markdown: plan.plan_markdown,
      questions: plan.questions,
      answers: plan.answers,
    })
  }, [task?.pipeline_plan, task?.status, task?.task_id])

  const pipelinePlan = useMemo(() => {
    if (!task) return null
    return extractPipelinePlanFromTask(task)
  }, [task, pipelinePlanSnapshotKey])

  const taskStatus = String(task?.status || "").toLowerCase()
  const needsPlanFirst =
    !task ||
    (Boolean(task) && taskRequiresPlanApproval(task) && !taskHasApprovedPlanExecution(task))
  const creatingPlan =
    !executionStartedLocal &&
    !pipelinePlan &&
    needsPlanFirst &&
    !isTerminalTaskStatus(taskStatus)

  // While the fake checklist runs, listen for plan_ready so we leave THINKING without waiting on poll.
  const onPlanDraftMessage = useCallback(
    (data: Record<string, unknown>) => {
      if (String(data.type || "") !== "plan_ready") return
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
    [queryClient, taskId]
  )
  useWebSocket({
    taskId,
    enabled: Boolean(taskId) && creatingPlan,
    onMessage: onPlanDraftMessage,
  })

  const {
    milestones,
    progressDone,
    progressTotal,
    elapsed,
    statusLabel,
    isActive,
    streamMode,
    graphMetrics,
    progress,
  } = useTaskLiveExecution({
    task,
    enabled: Boolean(taskId) && (!planReview || executionStartedLocal) && !creatingPlan,
    isTaskFetching: isFetching,
  })

  const showExecutionPanel = !planReview && !creatingPlan
  const liveExecuting = executionStartedLocal || (showExecutionPanel && isActive)
  const displayStages = getPipelineDisplayMilestones(milestones)
  const parallel = progress?.parallel_summary

  const postParallelFocus = useMemo(() => {
    const running = displayStages.find((m) => m.status === "running")
    if (running && isPostParallelStage(running.id)) {
      return { key: normalizePipelineStageKey(running.id), status: "running" as const }
    }
    const fromProgress = normalizePipelineStageKey(progress?.current_stage)
    if (isPostParallelStage(fromProgress)) {
      return { key: fromProgress, status: "running" as const }
    }
    const postDone = [...displayStages]
      .reverse()
      .find((m) => m.status === "done" && isPostParallelStage(m.id))
    if (postDone && !displayStages.some((m) => m.status === "running")) {
      return { key: normalizePipelineStageKey(postDone.id), status: "done" as const }
    }
    return null
  }, [displayStages, progress?.current_stage])

  const executionTodos = useMemo(() => {
    if (!pipelinePlan?.plan_markdown?.trim()) return []
    const parsed = parsePipelinePlanMarkdown(pipelinePlan.plan_markdown, {
      taskId,
      intentKind: pipelinePlan.intent_kind,
      modulesFromPayload: pipelinePlan.modules,
    })
    if (parsed.todos.length === 0) return []
    const stagesDone = displayStages.filter((stage) => stage.status === "done").length
    const parallelDoneCount =
      parallel && parallel.total > 0
        ? Math.round((parallel.completed / parallel.total) * parsed.todos.length)
        : 0
    const postParallel = Boolean(postParallelFocus)
    const allDone =
      postParallel ||
      (!isActive && statusLabel.toUpperCase().includes("COMPLETED")) ||
      (displayStages.length > 0 && displayStages.every((stage) => stage.status === "done"))
    const completed = allDone
      ? parsed.todos.length
      : Math.max(progressDone, stagesDone, parallelDoneCount)
    return syncPlanTodosToStageProgress(parsed.todos, completed, {
      allDone,
      isActive:
        !allDone &&
        (isActive || displayStages.some((stage) => stage.status === "running")),
    })
  }, [
    pipelinePlan?.plan_markdown,
    pipelinePlan?.intent_kind,
    pipelinePlan?.modules,
    taskId,
    progressDone,
    displayStages,
    isActive,
    statusLabel,
    parallel,
    postParallelFocus,
  ])

  const currentStep =
    graphMetrics?.currentStageLabel ||
    displayStages.find((m) => m.status === "running")?.label ||
    (progress?.current_stage ? formatStageId(progress.current_stage) : null)

  const running = isActive
  const statusUpper = statusLabel.toUpperCase()

  const streamLabel =
    streamMode === "live"
      ? TASK_LIVE_RUN.streamLive
      : streamMode === "polling"
        ? TASK_LIVE_RUN.streamPolling
        : TASK_LIVE_RUN.streamSynced

  useEffect(() => {
    terminalFiredRef.current = null
    setExpanded(true)
    setExecutionStartedLocal(false)
  }, [taskId])

  useEffect(() => {
    if (!task?.status || terminalFiredRef.current === taskId) return
    const st = String(task.status).toLowerCase()
    if (st === "completed") {
      terminalFiredRef.current = taskId
      setExpanded(false)
      onCompleted?.(taskId, task)
    } else if (st === "failed" || st === "error" || st === "cancelled" || st === "timeout") {
      terminalFiredRef.current = taskId
      const err =
        typeof (task as Task & { error?: string }).error === "string"
          ? (task as Task & { error: string }).error
          : undefined
      onFailed?.(taskId, err)
    }
  }, [task, taskId, onCompleted, onFailed])

  const panelTitle = creatingPlan
    ? "Pipeline Run"
    : planReview
      ? pipelinePlan &&
        isCodePipelinePlan(
          pipelinePlan.intent_kind,
          parsePipelinePlanMarkdown(pipelinePlan.plan_markdown, {
            taskId,
            intentKind: pipelinePlan.intent_kind,
            modulesFromPayload: pipelinePlan.modules,
          })
        )
        ? "Stage 1 · Frontend build plan"
        : "Stage 1 · Master & Decompose"
      : liveExecuting
        ? postParallelFocus?.status === "running"
          ? postParallelFocus.key === "supervisor"
            ? "Supervisor · Reworking result"
            : "Aggregator · Merging parallel work"
          : "Pipeline mode · Executing"
        : statusUpper.includes("COMPLETED")
          ? "Pipeline complete"
          : "Pipeline mode"

  const panelStatusLabel = creatingPlan
    ? "THINKING"
    : planReview
      ? "AWAITING INPUT"
      : executionStartedLocal && !running && statusUpper.includes("COMPLETED")
        ? "COMPLETE"
        : liveExecuting
          ? postParallelFocus?.status === "running" && postParallelFocus.key === "supervisor"
            ? "SUPERVISING"
            : postParallelFocus?.status === "running" && postParallelFocus.key === "aggregator"
              ? "AGGREGATING"
              : "RUNNING"
          : statusUpper.replace(/_/g, " ")

  const tone: PipelinePanelTone = creatingPlan
    ? "thinking"
    : planReview
      ? "review"
      : liveExecuting || running
        ? "running"
        : statusUpper.includes("COMPLETED")
          ? "complete"
          : statusUpper.includes("FAIL") || statusUpper.includes("ERROR")
            ? "error"
            : "idle"

  const totalStages = progressTotal || displayStages.length || 5
  const complete =
    statusUpper.includes("COMPLETED") ||
    (displayStages.length > 0 && displayStages.every((stage) => stage.status === "done"))
  const runHref = taskDetailHref(taskId, conversationId)
  const modules = pipelinePlan?.modules?.length
    ? pipelinePlan.modules
    : ["datagatherer", "economicanalyzer", "reportgenerator"]

  const statusDisplay =
    task?.status && task.status in TASK_STATUS_LABELS
      ? TASK_STATUS_LABELS[task.status as Task["status"]]
      : panelStatusLabel

  const agentsLabel = graphMetrics
    ? `${graphMetrics.completedNodes}/${graphMetrics.totalNodes}`
    : parallel && parallel.total > 0
      ? `${parallel.completed}/${parallel.total} workers`
      : null

  const outputFormatLabel = pipelinePlan?.intent_kind
    ? pipelinePlanOutputFormatLabel(pipelinePlan.intent_kind)
    : null

  const workstreamLabel = task?.sdlc_phase
    ? String(task.sdlc_phase).replace(/_/g, " ")
    : task?.product_id
      ? "Product task"
      : "Chat pipeline"

  const collapsedBrief = creatingPlan
    ? `Stage 1 · Master & Decompose · Creating plan… · ${elapsed || "Just now"}`
    : planReview
      ? `Plan ready · before Parallel · ${elapsed || "Just now"}`
      : liveExecuting || running
        ? postParallelFocus?.status === "running"
          ? `${postParallelFocus.key === "supervisor" ? "Supervisor" : "Aggregator"} · reworking · ${elapsed || "0s"}`
          : `Executing · ${progressDone}/${totalStages} stages · ${elapsed || "0s"}`
        : complete
          ? `Pipeline complete · ${progressDone}/${totalStages} stages`
          : `${panelStatusLabel} · ${elapsed || "Just now"}`

  return (
    <PipelinePanelShell
      tone={tone}
      className={className}
      aria-label={
        creatingPlan
          ? "Creating pipeline plan"
          : planReview
            ? "Pipeline plan review"
            : "Pipeline run progress"
      }
    >
      <PipelinePanelHeader
        tone={tone}
        title={panelTitle}
        subtitle={taskId}
        statusLabel={panelStatusLabel}
        streamLabel={!planReview && !creatingPlan ? streamLabel : null}
        streamLive={streamMode === "live"}
        metaLabel={creatingPlan ? "Just now" : elapsed}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((v) => !v)}
        onDismiss={onDismiss}
      />

      <PipelinePanelCollapsibleBody
        expanded={expanded}
        brief={collapsedBrief}
        className="space-y-4 px-4 py-4 sm:px-5"
      >
        {prematureExecution ? (
          <div className="rounded-xl border border-destructive/40 bg-[#12151c] px-3 py-2.5">
            <p className="text-xs font-semibold text-destructive">
              Pipeline started before plan approval
            </p>
            <p className="mt-1 text-[11px] text-white/50">
              Answer clarification questions and click <strong>Run pipeline</strong> to continue.
            </p>
          </div>
        ) : null}

        {creatingPlan ? <PipelinePlanThinkingBody /> : null}

        {planReview && pipelinePlan ? (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.55fr)_minmax(13rem,0.9fr)]">
            <ChatPipelinePlanCard
              taskId={taskId}
              plan={pipelinePlan}
              reviewMode
              runPhase="review"
              onContinued={() => {
                setExecutionStartedLocal(true)
                setExpanded(true)
                onExecutionStarted?.(taskId)
              }}
              onContinueFailed={() => {
                setExecutionStartedLocal(false)
                void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
              }}
            />
            <PipelineRunDetailsCard
              taskId={taskId}
              taskPrompt={task?.task}
              statusLabel="Plan review"
              streamLabel={null}
              elapsedLabel={elapsed}
              stagesLabel="Before Parallel · Plan review"
              agentsLabel={agentsLabel}
              outputFormatLabel={outputFormatLabel}
              workstreamLabel={workstreamLabel}
              href={runHref}
            />
          </div>
        ) : null}

        {!planReview && pipelinePlan?.questions && pipelinePlan.questions.length > 0 ? (
          <ChatPipelinePlanAnswersSummary
            questions={pipelinePlan.questions}
            answers={{}}
            storedAnswers={pipelinePlan.answers}
          />
        ) : null}

        {showExecutionPanel ? (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.55fr)_minmax(13rem,0.9fr)]">
            <div className="min-w-0 space-y-4">
              <PipelineModuleCards modules={modules} />

              <PipelineExecutingProgress
                done={progressDone}
                total={totalStages}
                elapsedLabel={complete && !running ? "0s" : elapsed}
                currentStep={currentStep}
                metricsLine={
                  <>
                    {graphMetrics
                      ? `${graphMetrics.completedNodes}/${graphMetrics.totalNodes} agents`
                      : null}
                    {graphMetrics && parallel && parallel.total > 0 ? " · " : null}
                    {parallel && parallel.total > 0
                      ? `Workers ${parallel.completed}/${parallel.total}${
                          parallel.running > 0 ? ` (${parallel.running} active)` : ""
                        }`
                      : null}
                  </>
                }
              />

              {postParallelFocus ? (
                <>
                  <PipelinePostParallelActivity
                    stageKey={postParallelFocus.key}
                    status={postParallelFocus.status}
                  />
                  {executionTodos.length > 0 ? (
                    <p className="text-[11px] text-white/40">
                      Build checklist complete · {executionTodos.length} steps done
                    </p>
                  ) : null}
                </>
              ) : (
                <PipelineExecutionChecklist
                  todos={executionTodos}
                  stages={displayStages}
                  parallelSummary={parallel}
                />
              )}
            </div>

            <PipelineRunDetailsCard
              taskId={taskId}
              taskPrompt={task?.task}
              statusLabel={statusDisplay}
              streamLabel={streamLabel}
              streamLive={streamMode === "live"}
              elapsedLabel={elapsed}
              stagesLabel={
                postParallelFocus?.status === "running"
                  ? postParallelFocus.key === "supervisor"
                    ? "After Parallel · Supervisor"
                    : "After Parallel · Aggregator"
                  : `${progressDone}/${totalStages} ${TASK_LIVE_RUN.metrics.stagesProgress}`
              }
              agentsLabel={agentsLabel}
              outputFormatLabel={outputFormatLabel}
              workstreamLabel={workstreamLabel}
              href={runHref}
            />
          </div>
        ) : null}

        <div className="flex justify-end border-t border-white/8 pt-3">
          <Link
            href={runHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 hover:underline"
          >
            Open full run
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PipelinePanelCollapsibleBody>
    </PipelinePanelShell>
  )
}
