import { formatDistanceToNow } from "date-fns"
import { parseApiTimestamp } from "@/lib/datetime-local"
import { pipelineStageLabel } from "@/constants/pipeline-template-roles"
import { derivePipelineProgressFromEvent } from "@/lib/pipeline-progress"
import { computeTaskGraphMetrics, type TaskGraphMetrics } from "@/lib/task-graph-metrics"
import type { PipelineProgressPayload } from "@/types/api"
import type { Task } from "@/types/api"

export type LiveEventKind = "info" | "success" | "warning" | "error"

export interface TaskLiveLogEntry {
  id: string
  at: number
  kind: LiveEventKind
  text: string
}

export interface TaskWorkerAction {
  id: string
  at: number
  verb: string
  target: string
  feedback?: string
  status: "pending" | "ok" | "error"
}

export interface TaskMilestoneRow {
  id: string
  label: string
  status: "done" | "running" | "waiting"
}

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "error",
  "cancelled",
  "timeout",
])

const PIPELINE_IDS = [
  "pipeline:master",
  "pipeline:decomposer",
  "pipeline:parallel",
  "pipeline:aggregator",
  "pipeline:supervisor",
] as const

const DEFAULT_PIPELINE_STAGE_KEYS = [
  "master",
  "decomposer",
  "parallel",
  "aggregator",
  "supervisor",
] as const

function isPipelineStageId(id: string): boolean {
  const key = id.replace(/^pipeline:/, "").toLowerCase()
  return (DEFAULT_PIPELINE_STAGE_KEYS as readonly string[]).includes(key)
}

/** Pipeline-only milestones for progress UI (chat panel, mission control). */
export function getPipelineDisplayMilestones(rows: TaskMilestoneRow[]): TaskMilestoneRow[] {
  const pipeline = rows.filter((r) => isPipelineStageId(r.id))
  if (pipeline.length > 0) return pipeline
  return rows.filter((r) => !r.id.startsWith("__")).slice(0, DEFAULT_PIPELINE_STAGE_KEYS.length)
}

export function isTaskActiveStatus(status: string | undefined): boolean {
  const s = (status || "").toLowerCase()
  if (s === "awaiting_plan_review") return true
  return Boolean(s && !TERMINAL_STATUSES.has(s))
}

export function formatLiveTimeAgo(atMs: number): string {
  return formatDistanceToNow(new Date(atMs), { addSuffix: true })
}

export function formatElapsedSince(startIso: string | undefined, nowMs: number): string {
  if (!startIso) return "—"
  const start = parseApiTimestamp(startIso)?.getTime()
  if (start === undefined || Number.isNaN(start)) return "—"
  return formatDurationSeconds(Math.max(0, Math.floor((nowMs - start) / 1000)))
}

export function formatDurationSeconds(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`
  }
  if (m > 0) return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  return `${s}s`
}

export interface TaskRunElapsedOptions {
  /** Client anchor when the UI first observes an active run (stopwatch from 0). */
  liveAnchorMs?: number | null
  /** First pipeline event timestamp from the live stream (e.g. task_running). */
  firstEventAtMs?: number | null
}

function graphStartedTimestampsMs(task: Pick<Task, "graph">): number[] {
  const nodes =
    task.graph && typeof task.graph === "object"
      ? (task.graph as Record<string, unknown>).nodes
      : null
  if (!nodes || typeof nodes !== "object") return []

  const out: number[] = []
  for (const rawNode of Object.values(nodes as Record<string, unknown>)) {
    if (!rawNode || typeof rawNode !== "object") continue
    const startedAt = (rawNode as Record<string, unknown>).started_at
    if (typeof startedAt !== "string" || !startedAt.trim()) continue
    const ms = parseApiTimestamp(startedAt)?.getTime()
    if (ms !== undefined && !Number.isNaN(ms)) out.push(ms)
  }
  return out
}

/** Resolve when the current pipeline run started (ms). Active runs never use stale created_at. */
export function resolveTaskRunStartMs(
  task: Pick<Task, "created_at" | "status" | "graph">,
  options?: TaskRunElapsedOptions
): number | null {
  const status = String(task.status || "").toLowerCase()
  if (status === "pending" || status === "decomposing") {
    return null
  }

  const terminal = TERMINAL_STATUSES.has(status)
  const candidates: number[] = [...graphStartedTimestampsMs(task)]

  const firstEvent = options?.firstEventAtMs
  if (typeof firstEvent === "number" && Number.isFinite(firstEvent)) {
    candidates.push(firstEvent)
  }
  const liveAnchor = options?.liveAnchorMs
  if (typeof liveAnchor === "number" && Number.isFinite(liveAnchor)) {
    candidates.push(liveAnchor)
  }

  if (candidates.length > 0) {
    return Math.min(...candidates)
  }

  // Queued tasks with no run signals yet: show 0s until live anchor or graph timestamps arrive.
  if (!terminal) {
    return null
  }

  const created = parseApiTimestamp(task.created_at)?.getTime()
  return created ?? null
}

/** Wall-clock stopwatch for the status banner. Active runs count up from run start, not task created_at. */
export function formatTaskRunElapsed(
  task: Pick<Task, "created_at" | "updated_at" | "status" | "graph">,
  nowMs: number,
  graphMetrics?: TaskGraphMetrics | null,
  options?: TaskRunElapsedOptions
): string {
  const status = String(task.status || "").toLowerCase()
  const terminal = TERMINAL_STATUSES.has(status)
  const start = resolveTaskRunStartMs(task, options)
  if (start === null) return "0s"

  const wallElapsedSec = terminal
    ? Math.max(
        0,
        Math.floor(
          ((parseApiTimestamp(task.updated_at || task.created_at)?.getTime() ?? start) - start) / 1000
        )
      )
    : Math.max(0, Math.floor((nowMs - start) / 1000))

  // Summed graph durations are for completed runs only; they can inflate live timers (e.g. 5h+).
  if (terminal && graphMetrics && graphMetrics.totalDurationSec > 0.5) {
    const graphElapsedSec = Math.round(graphMetrics.totalDurationSec)
    const plausibleUpperBound = Math.max(wallElapsedSec + 120, 300)
    if (graphElapsedSec <= plausibleUpperBound) {
      return formatDurationSeconds(graphElapsedSec)
    }
  }

  if (terminal) {
    const endIso = task.updated_at || task.created_at
    const end = parseApiTimestamp(endIso)?.getTime()
    if (end !== undefined && end >= start) {
      return formatDurationSeconds(Math.floor((end - start) / 1000))
    }
    return "—"
  }
  return formatDurationSeconds(wallElapsedSec)
}

function graphNodeLabel(nodeId: string, nodeData: Record<string, unknown>): string {
  if (nodeId.startsWith("pipeline:")) {
    return pipelineStageLabel(nodeId.replace(/^pipeline:/, ""))
  }
  const agentType = String(nodeData.agent_type || "").trim()
  if (agentType) {
    const fromRole = pipelineStageLabel(agentType)
    if (fromRole !== agentType.toLowerCase()) return fromRole
    const named =
      agentType.charAt(0).toUpperCase() + agentType.slice(1).replace(/_/g, " ")
    const shortId = nodeId.length > 14 ? nodeId.slice(-8) : nodeId
    return `Parallel · ${named} (${shortId})`
  }
  const shortId = nodeId.length > 14 ? nodeId.slice(-8) : nodeId
  return `Parallel · ${shortId}`
}

function nodeStatusToMilestone(status: string | undefined): TaskMilestoneRow["status"] {
  const s = (status || "").toLowerCase()
  if (s === "completed" || s === "success" || s === "done") return "done"
  if (s === "running" || s === "in_progress" || s === "active" || s === "processing")
    return "running"
  return "waiting"
}

function applyTaskStatusToMilestones(
  rows: TaskMilestoneRow[],
  taskStatus?: string
): TaskMilestoneRow[] {
  const s = String(taskStatus || "").toLowerCase()
  if (s === "completed") {
    return rows.map((r) => ({ ...r, status: "done" as const }))
  }
  if (s === "failed" || s === "error" || s === "cancelled" || s === "timeout") {
    return rows.map((r) =>
      r.status === "running" ? { ...r, status: "waiting" as const } : r
    )
  }
  return rows
}

export function buildMilestonesFromGraph(
  graph: Record<string, unknown> | undefined,
  currentStage?: string,
  taskStatus?: string
): TaskMilestoneRow[] {
  const nodes = graph?.nodes
  if (!nodes || typeof nodes !== "object") {
    const cur = (currentStage || "").replace(/^pipeline:/, "").toLowerCase()
    const normalizedCur = cur === "parallel_execution" ? "parallel" : cur
    // After plan approval, Master/Decompose are already done — default live stage is Parallel.
    const activeKey = normalizedCur || "parallel"
    const rows = DEFAULT_PIPELINE_STAGE_KEYS.map((id) => {
      let status: TaskMilestoneRow["status"] = "waiting"
      if (id === activeKey) status = "running"
      else if (
        DEFAULT_PIPELINE_STAGE_KEYS.indexOf(id) <
        DEFAULT_PIPELINE_STAGE_KEYS.indexOf(activeKey as (typeof DEFAULT_PIPELINE_STAGE_KEYS)[number])
      ) {
        status = "done"
      }
      return { id: `pipeline:${id}`, label: pipelineStageLabel(id), status }
    })
    const withActive =
      !isTaskActiveStatus(taskStatus)
        ? rows.map((row) => ({ ...row, status: "waiting" as const }))
        : rows
    return applyTaskStatusToMilestones(withActive, taskStatus)
  }

  const entries = Object.entries(nodes as Record<string, Record<string, unknown>>).filter(
    ([k]) => !k.startsWith("__")
  )

  const rows: TaskMilestoneRow[] = []

  for (const pid of PIPELINE_IDS) {
    const node = entries.find(([k]) => k === pid)?.[1]
    if (node) {
      rows.push({
        id: pid,
        label: pipelineStageLabel(pid.replace(/^pipeline:/, "")),
        status: nodeStatusToMilestone(String(node.status)),
      })
    }
  }

  const used = new Set(PIPELINE_IDS)
  const workers = entries
    .filter(([k]) => !used.has(k as (typeof PIPELINE_IDS)[number]))
    .sort(([a], [b]) => a.localeCompare(b))

  for (const [id, node] of workers) {
    rows.push({
      id,
      label: graphNodeLabel(id, node),
      status: nodeStatusToMilestone(String(node.status)),
    })
  }

  if (rows.length === 0) {
    return applyTaskStatusToMilestones(
      [{ id: "pipeline", label: "Pipeline", status: currentStage ? "running" : "waiting" }],
      taskStatus
    )
  }

  const cur = (currentStage || "").replace(/^pipeline:/, "").toLowerCase()
  const normalizedCur = cur === "parallel_execution" ? "parallel" : cur || "parallel"
  let mapped = rows
  if (normalizedCur) {
    let foundRunning = false
    mapped = rows.map((r) => {
      const key = r.id.replace(/^pipeline:/, "").toLowerCase()
      if (key === normalizedCur || r.label.toLowerCase().includes(normalizedCur)) {
        foundRunning = true
        return { ...r, status: "running" as const }
      }
      if (!foundRunning && (r.status === "waiting" || key === "master" || key === "decomposer")) {
        return { ...r, status: "done" as const }
      }
      return r
    })
  }

  return applyTaskStatusToMilestones(mapped, taskStatus)
}

/** Progress for the banner: pipeline stages when present, else all milestones. */
export function countPipelineStageProgress(
  rows: TaskMilestoneRow[],
  taskStatus?: string
): { done: number; total: number } {
  const pipeline = getPipelineDisplayMilestones(rows)
  const use = pipeline.length > 0 ? pipeline : rows
  if (use.length === 0) return { done: 0, total: 0 }

  const s = String(taskStatus || "").toLowerCase()
  if (s === "completed") {
    return { done: use.length, total: use.length }
  }

  const total = use.length
  const done = use.filter((r) => r.status === "done").length
  return { done, total }
}

export function countMilestoneProgress(rows: TaskMilestoneRow[]): {
  done: number
  total: number
} {
  const total = Math.max(rows.length, 1)
  const done = rows.filter((r) => r.status === "done").length
  return { done, total }
}

export function progressFromTaskGraph(
  task: Pick<Task, "graph" | "status"> | undefined
): PipelineProgressPayload | null {
  if (!task?.graph || typeof task.graph !== "object") return null
  const metrics = computeTaskGraphMetrics(task.graph)
  if (!metrics) return null

  const nodes = (task.graph as Record<string, unknown>).nodes as Record<
    string,
    Record<string, unknown>
  >
  const parallel = Object.entries(nodes).filter(([k]) => !k.startsWith("__") && !k.startsWith("pipeline:"))
  let running = 0
  let completed = 0
  let failed = 0
  for (const [, node] of parallel) {
    const st = String(node.status || "").toLowerCase()
    if (st === "completed" || st === "success" || st === "done") completed += 1
    else if (st === "failed" || st === "error") failed += 1
    else if (st === "running" || st === "in_progress" || st === "active") running += 1
  }

  let current_stage = ""
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (nodeId.startsWith("__")) continue
    const st = String(node.status || "").toLowerCase()
    if (st === "running" || st === "in_progress" || st === "active" || st === "processing") {
      current_stage = nodeId
      break
    }
  }
  if (!current_stage) {
    const pipelineIds = Object.keys(nodes).filter((k) => k.startsWith("pipeline:"))
    current_stage = pipelineIds[pipelineIds.length - 1] || "pipeline:supervisor"
  }

  return {
    current_stage,
    stage_status: String(task.status || "running"),
    subtask_count: parallel.length,
    execution_order_count: parallel.length,
    parallel_summary: {
      total: parallel.length,
      running,
      completed,
      failed,
    },
    subtasks_preview: [],
    stage_output_preview: {},
  }
}

let _seq = 0
export function nextLiveId(): string {
  _seq += 1
  return `${Date.now()}-${_seq}`
}

export function ingestWebSocketEvent(
  data: Record<string, unknown>,
  prev: {
    logs: TaskLiveLogEntry[]
    actions: TaskWorkerAction[]
    progress: PipelineProgressPayload | null
  }
): {
  logs: TaskLiveLogEntry[]
  actions: TaskWorkerAction[]
  progress: PipelineProgressPayload | null
} {
  const at = Date.now()
  const logs = [...prev.logs]
  const actions = [...prev.actions]
  let progress = prev.progress

  const pushLog = (kind: LiveEventKind, text: string) => {
    logs.push({ id: nextLiveId(), at, kind, text })
  }

  const pushAction = (
    verb: string,
    target: string,
    feedback?: string,
    status: TaskWorkerAction["status"] = "pending"
  ) => {
    actions.push({ id: nextLiveId(), at, verb, target, feedback, status })
  }

  const type = String(data.type || "")

  const stepLabel = (raw: string) => pipelineStageLabel(raw.replace(/^pipeline:/, ""))

  if (type === "task_running") {
    pushLog("info", "Task queued — PI pipeline starting")
    pushAction("Run", "task.submit", "→ Pipeline scheduled", "pending")
  }

  if (type === "stage_started") {
    const stage = stepLabel(String(data.stage || ""))
    pushLog("info", `${stage} started`)
    pushAction("Stage", stage, "→ In progress", "pending")
    progress = derivePipelineProgressFromEvent(data)
  }

  if (type === "stage_completed") {
    const stage = stepLabel(String(data.stage || ""))
    pushLog("success", `${stage} finished`)
    pushAction("Stage", stage, "→ Done", "ok")
    progress = derivePipelineProgressFromEvent(data)
  }

  if (type === "progress") {
    progress = derivePipelineProgressFromEvent(data)
    const p = progress.parallel_summary
    if (p.total > 0) {
      const stage = stepLabel(progress.current_stage)
      const msg = `${stage}: ${p.completed}/${p.total} assistants done (${p.running} active)`
      const last = logs[logs.length - 1]
      if (last?.text !== msg) pushLog("info", msg)
    }
    const preview = progress.subtasks_preview?.[0]
    if (preview?.title) {
      pushAction("Plan", preview.subtask_id || "subtask", preview.title.slice(0, 80), "ok")
    }
  }

  if (type === "agent_started") {
    const payload = (data.data as Record<string, unknown>) || data
    const agentType = String(payload.agent_type || payload.agent_id || "assistant")
    const label = pipelineStageLabel(agentType)
    pushLog("info", `Assistant started: ${label}`)
    pushAction("Assistant", label, "→ Running", "pending")
  }

  if (type === "agent_completed") {
    const payload = (data.data as Record<string, unknown>) || data
    const agentType = String(payload.agent_type || payload.agent_id || "assistant")
    const label = pipelineStageLabel(agentType)
    pushLog("success", `Assistant finished: ${label}`)
    pushAction("Assistant", label, "→ Done", "ok")
  }

  if (type === "task_completed" || type === "completed") {
    pushLog("success", "PI pipeline completed")
    pushAction("Run", "task.complete", "→ Final result ready", "ok")
  }

  if (type === "error") {
    pushLog("error", `Run failed: ${String(data.message || "unknown error")}`)
    pushAction("Run", "task.failed", "→ Stopped", "error")
  }

  return {
    logs: logs.slice(-80),
    actions: actions.slice(-40),
    progress,
  }
}

export function taskMissionTitle(task: Pick<Task, "task">): string {
  const short = task.task.trim().split(/\n/)[0] || "Task"
  return short.length > 72 ? `${short.slice(0, 70)}…` : short
}

/** @deprecated Use TASK_LIVE_RUN constants in the panel; kept for typing. */
export function taskMissionMeta(_task: Pick<Task, "sdlc_phase">): {
  execution: string
  workstream: string
} {
  return {
    execution: "PI pipeline",
    workstream: "Workspace task",
  }
}
