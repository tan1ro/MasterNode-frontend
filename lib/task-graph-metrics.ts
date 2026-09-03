import { pipelineStageLabel } from "@/constants/pipeline-template-roles"

export interface TaskGraphMetrics {
  totalNodes: number
  completedNodes: number
  runningNodes: number
  pendingNodes: number
  totalDurationSec: number
  currentStageLabel: string | null
}

function parseDurationSeconds(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) return null
  // Some backends emit milliseconds while others emit seconds.
  // Treat large values as ms to keep elapsed display accurate.
  return raw >= 1000 ? raw / 1000 : raw
}

function nodeStatus(raw: unknown): string {
  return String(raw || "pending").toLowerCase()
}

function stageLabelFromId(id: string, agentType?: string): string {
  if (id.startsWith("pipeline:")) {
    return pipelineStageLabel(id.replace(/^pipeline:/, ""))
  }
  const at = (agentType || id).replace(/^pipeline:/, "").trim()
  const fromRole = pipelineStageLabel(at)
  if (fromRole !== at.toLowerCase()) return fromRole
  if (agentType) {
    const named = agentType.charAt(0).toUpperCase() + agentType.slice(1).replace(/_/g, " ")
    return `Parallel · ${named}`
  }
  return pipelineStageLabel(at)
}

export function computeTaskGraphMetrics(
  graph: Record<string, unknown> | undefined,
  wsCurrentStage?: string | null
): TaskGraphMetrics | null {
  const nodes = graph?.nodes
  if (!nodes || typeof nodes !== "object") return null

  const entries = Object.entries(nodes as Record<string, Record<string, unknown>>).filter(
    ([k]) => !k.startsWith("__")
  )
  if (entries.length === 0) return null

  let completedNodes = 0
  let runningNodes = 0
  let pendingNodes = 0
  let totalDurationSec = 0
  let currentStageLabel: string | null = null

  for (const [nodeId, nodeData] of entries) {
    const st = nodeStatus(nodeData.status)
    if (st === "completed" || st === "success" || st === "done") completedNodes += 1
    else if (st === "running" || st === "in_progress" || st === "active" || st === "processing") {
      runningNodes += 1
      if (!currentStageLabel) {
        currentStageLabel = stageLabelFromId(nodeId, String(nodeData.agent_type || ""))
      }
    } else pendingNodes += 1

    if (nodeData.started_at && nodeData.completed_at) {
      const start = new Date(String(nodeData.started_at)).getTime()
      const end = new Date(String(nodeData.completed_at)).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        totalDurationSec += (end - start) / 1000
      }
    } else {
      const durationSec = parseDurationSeconds(nodeData.duration)
      if (durationSec !== null) {
        totalDurationSec += durationSec
      }
    }
  }

  if (wsCurrentStage?.trim()) {
    currentStageLabel = stageLabelFromId(wsCurrentStage)
  }

  return {
    totalNodes: entries.length,
    completedNodes,
    runningNodes,
    pendingNodes,
    totalDurationSec,
    currentStageLabel,
  }
}
