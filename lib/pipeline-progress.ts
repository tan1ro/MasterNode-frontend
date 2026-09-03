import type { PipelineProgressPayload, PipelineParallelSummary } from "@/types/api"

const EMPTY_PARALLEL: PipelineParallelSummary = {
  total: 0,
  running: 0,
  completed: 0,
  failed: 0,
}

function normalizeParallelSummary(raw: unknown): PipelineParallelSummary {
  if (!raw || typeof raw !== "object") return EMPTY_PARALLEL
  const obj = raw as Record<string, unknown>
  return {
    total: Number(obj.total || 0),
    running: Number(obj.running || 0),
    completed: Number(obj.completed || 0),
    failed: Number(obj.failed || 0),
  }
}

function countWorkersFromGraph(rawGraph: unknown): PipelineParallelSummary {
  if (!rawGraph || typeof rawGraph !== "object") return EMPTY_PARALLEL
  const nodes = (rawGraph as Record<string, unknown>).nodes
  if (!nodes || typeof nodes !== "object") return EMPTY_PARALLEL
  const workerIds = Object.keys(nodes).filter((id) => !id.startsWith("__"))
  let running = 0
  let completed = 0
  let failed = 0
  for (const wid of workerIds) {
    const node = (nodes as Record<string, unknown>)[wid]
    const status = String(
      (node as Record<string, unknown> | undefined)?.status || ""
    ).toLowerCase()
    if (status === "completed" || status === "success" || status === "done") completed += 1
    else if (status === "failed" || status === "error") failed += 1
    else if (status === "running" || status === "in_progress" || status === "active") running += 1
  }
  return { total: workerIds.length, running, completed, failed }
}

function countSubtasksFromPartialResults(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0
  return Object.keys(raw as Record<string, unknown>).length
}

function safePreview(raw: unknown): string {
  if (raw == null) return "No output yet"
  if (typeof raw === "string") return raw.slice(0, 900)
  try {
    return JSON.stringify(raw, null, 2).slice(0, 900)
  } catch {
    return String(raw).slice(0, 900)
  }
}

export function derivePipelineProgressFromEvent(event: Record<string, unknown>): PipelineProgressPayload {
  const pipeline = event.pipeline as PipelineProgressPayload | undefined
  const step = String(event.step || pipeline?.current_stage || "initializing")
  const parallel = normalizeParallelSummary(pipeline?.parallel_summary) || EMPTY_PARALLEL
  const fromGraph = countWorkersFromGraph(event.graph)
  const mergedParallel: PipelineParallelSummary = {
    total: parallel.total || fromGraph.total,
    running: parallel.running || fromGraph.running,
    completed: parallel.completed || fromGraph.completed,
    failed: parallel.failed || fromGraph.failed,
  }
  const subtaskCount =
    Number(pipeline?.subtask_count || 0) ||
    countSubtasksFromPartialResults(event.partial_results)

  const stageOutputPreview = pipeline?.stage_output_preview || {
    workers: safePreview(event.partial_results),
  }

  return {
    current_stage: step,
    stage_status: pipeline?.stage_status || "running",
    subtask_count: subtaskCount,
    execution_order_count: Number(pipeline?.execution_order_count || 0),
    parallel_summary: mergedParallel,
    subtasks_preview: pipeline?.subtasks_preview || [],
    stage_output_preview: stageOutputPreview,
  }
}
