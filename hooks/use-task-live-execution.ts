"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import {
  buildMilestonesFromGraph,
  countPipelineStageProgress,
  formatTaskRunElapsed,
  ingestWebSocketEvent,
  isTaskActiveStatus,
  progressFromTaskGraph,
  type TaskLiveLogEntry,
  type TaskMilestoneRow,
  type TaskWorkerAction,
} from "@/lib/task-live-execution"
import { computeTaskGraphMetrics } from "@/lib/task-graph-metrics"
import type { PipelineProgressPayload, Task } from "@/types/api"

export interface UseTaskLiveExecutionOptions {
  task: Task | undefined
  enabled?: boolean
  onPipelineEvent?: () => void
  /** True while parent is refetching task (HTTP poll). */
  isTaskFetching?: boolean
}

interface LiveState {
  logs: TaskLiveLogEntry[]
  actions: TaskWorkerAction[]
  progress: PipelineProgressPayload | null
}

export function useTaskLiveExecution({
  task,
  enabled = true,
  onPipelineEvent,
  isTaskFetching = false,
}: UseTaskLiveExecutionOptions) {
  const taskId = task?.task_id ?? ""
  const active = enabled && isTaskActiveStatus(task?.status)

  const [live, setLive] = useState<LiveState>({ logs: [], actions: [], progress: null })
  const [nowMs, setNowMs] = useState(() => Date.now())
  const liveRef = useRef(live)
  liveRef.current = live
  /** Stopwatch anchor: first moment this hook sees the task as active (starts at 0s). */
  const liveRunAnchorMsRef = useRef<number | null>(null)

  useEffect(() => {
    setLive({ logs: [], actions: [], progress: null })
    liveRunAnchorMsRef.current = null
  }, [taskId])

  useEffect(() => {
    if (!active) {
      liveRunAnchorMsRef.current = null
      return
    }
    if (liveRunAnchorMsRef.current === null) {
      liveRunAnchorMsRef.current = Date.now()
    }
  }, [active, taskId])

  useEffect(() => {
    const tick = active || (task && !isTaskActiveStatus(task.status))
    if (!tick) return
    const t = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [active, task])

  const onMessage = useCallback(
    (data: Record<string, unknown>) => {
      const next = ingestWebSocketEvent(data, liveRef.current)
      setLive(next)
      onPipelineEvent?.()
    },
    [onPipelineEvent]
  )

  const { isConnected } = useWebSocket({
    taskId,
    enabled: Boolean(taskId && active),
    onMessage,
  })

  const graphProgress = useMemo(() => progressFromTaskGraph(task), [task?.graph, task?.status])

  const mergedProgress = live.progress ?? graphProgress

  const milestones: TaskMilestoneRow[] = useMemo(
    () =>
      buildMilestonesFromGraph(
        task?.graph,
        mergedProgress?.current_stage,
        task?.status
      ),
    [task?.graph, mergedProgress?.current_stage, task?.status]
  )

  const graphMetrics = useMemo(
    () => computeTaskGraphMetrics(task?.graph, mergedProgress?.current_stage),
    [task?.graph, mergedProgress?.current_stage]
  )

  const { done, total } = countPipelineStageProgress(milestones, task?.status)

  const firstPipelineEventAtMs = useMemo(() => {
    const hit = live.logs.find((entry) =>
      /pipeline starting|queued|stage started/i.test(entry.text)
    )
    return hit?.at ?? null
  }, [live.logs])

  const elapsed = task
    ? formatTaskRunElapsed(task, nowMs, graphMetrics, {
        liveAnchorMs: active ? liveRunAnchorMsRef.current : null,
        firstEventAtMs: firstPipelineEventAtMs,
      })
    : "—"

  const statusLabel = (task?.status || "pending").toUpperCase().replace(/_/g, " ")

  const streamMode: "live" | "polling" | "synced" =
    active && isConnected
      ? "live"
      : active && isTaskFetching
        ? "polling"
        : "synced"

  return {
    logs: live.logs,
    actions: live.actions,
    progress: mergedProgress,
    milestones,
    graphMetrics,
    progressDone: done,
    progressTotal: total,
    elapsed,
    statusLabel,
    isConnected,
    isActive: active,
    streamMode,
    isTaskFetching,
  }
}
