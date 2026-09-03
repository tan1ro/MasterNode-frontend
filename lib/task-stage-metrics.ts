import type { ExecutionMetricsRow } from "@/types/api"
import type { Task } from "@/types/api"
import {
  formatAgentStageEntryLabel,
  resolveParallelAgentLabel,
  type AgentStageEntry,
} from "@/lib/parallel-agent-labels"

export type StageStatus = "done" | "running" | "waiting"

export interface StageProgressRow {
  id: string
  stage: string
  stageDetail?: string
  stageKind?: AgentStageEntry["kind"]
  status: StageStatus
  llm: string
  timeLabel: string
  progressPct: number
}

export interface LlmContributionRow {
  provider: string
  stages: number
  stageEntries: AgentStageEntry[]
  /** @deprecated use stageEntries */
  stageLabels: string[]
  seconds: number
  timeSharePct: number
  callSharePct: number
  llmCalls: number
  isDefault: boolean
  shareLabel: string
}

export interface TokenShareSummary {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  inputSharePct: number
  outputSharePct: number
}

export interface AgentUsageRow {
  id: string
  label: string
  provider: string
  durationSeconds?: number
  success?: boolean
}

const PIPELINE_ORDER = [
  "pipeline:master",
  "pipeline:decomposer",
  "pipeline:aggregator",
  "pipeline:supervisor",
] as const

function stageLabelForAgentId(
  aid: string,
  partialResults?: Record<string, unknown> | null
): string {
  return resolveParallelAgentLabel(aid, partialResults).title
}

function stageEntriesForAgentIds(
  agentIds: string[],
  partialResults?: Record<string, unknown> | null,
  stageCallsByAgent?: Record<string, number>
): AgentStageEntry[] {
  return sortAgentIds(agentIds).map((id) => {
    const entry = resolveParallelAgentLabel(id, partialResults)
    const calls = stageCallsByAgent?.[id]
    if (!calls || calls <= 0) return entry
    const callLabel = `${calls} API call${calls === 1 ? "" : "s"}`
    return {
      ...entry,
      calls,
      detail: entry.detail ? `${entry.detail} · ${callLabel}` : callLabel,
    }
  })
}

function resolveProviderForStage(
  agentId: string,
  executionProvider: string | null | undefined,
  stageProviderCalls?: Record<string, Record<string, number>>
): string {
  const pmap = stageProviderCalls?.[agentId]
  if (pmap) {
    let best: string | null = null
    let bestN = -1
    for (const [raw, count] of Object.entries(pmap)) {
      const n = Number(count) || 0
      if (n <= 0) continue
      const key = String(raw || "").trim().toUpperCase()
      if (key === "DEFAULT") continue
      if (n > bestN) {
        bestN = n
        best = key
      }
    }
    if (best) return normalizeProviderLabel(best)
  }
  return normalizeProviderLabel(executionProvider)
}

/** Public label for a pipeline / parallel agent id from execution metrics. */
export function formatAgentStageLabel(
  agentId: string,
  partialResults?: Record<string, unknown> | null
): string {
  return stageLabelForAgentId(agentId, partialResults)
}

function stageSortKey(agentId: string): number {
  if (agentId === "pipeline:master") return 10
  if (agentId === "pipeline:decomposer") return 20
  if (agentId === "pipeline:aggregator") return 40
  if (agentId === "pipeline:supervisor") return 50
  if (agentId && !agentId.startsWith("pipeline:")) return 30
  return 35
}

function sortAgentIds(agentIds: string[]): string[] {
  const unique = [...new Set(agentIds.filter(Boolean))]
  return unique.sort(
    (a, b) => stageSortKey(a) - stageSortKey(b) || a.localeCompare(b)
  )
}

function stageLabelsForAgentIds(
  agentIds: string[],
  partialResults?: Record<string, unknown> | null
): string[] {
  return stageEntriesForAgentIds(agentIds, partialResults).map((entry) => entry.title)
}

export function normalizeProviderLabel(p?: string | null): string {
  if (!p || !String(p).trim()) return "Default"
  return String(p).trim().toUpperCase()
}

export function isDefaultProviderLabel(provider: string): boolean {
  return provider === "Default"
}

/** Human-readable share: time %, or `0% · 64% calls` when routed by API usage. */
export function formatLlmShareLabel(
  timeSharePct: number,
  callSharePct: number,
  opts: { isDefault?: boolean; llmCalls?: number } = {}
): string {
  const hasCalls = (opts.llmCalls ?? 0) > 0 && callSharePct > 0
  const hasTime = timeSharePct > 0

  if (opts.isDefault && hasTime && !hasCalls) {
    return `${timeSharePct}%`
  }
  if (hasCalls) {
    return `${timeSharePct}% · ${callSharePct}% calls`
  }
  if (hasTime) {
    return `${timeSharePct}%`
  }
  return "0%"
}

export function buildStageProgressRows(
  task: Pick<Task, "status" | "partial_results"> | undefined,
  metrics: ExecutionMetricsRow | undefined
): StageProgressRow[] {
  const executions = metrics?.agent_executions || []
  const partialResults = task?.partial_results
  const byId = new Map(executions.map((e) => [e.agent_id || "", e]))
  const taskStatus = task?.status

  const rows: StageProgressRow[] = []

  const mkRow = (agentId: string, ex?: (typeof executions)[number]): StageProgressRow => {
    const dur = ex?.duration_seconds
    const timeLabel = typeof dur === "number" ? `${dur}s` : "—"
    const hasEx = Boolean(ex)
    const success = ex ? ex.success !== false : false
    let status: StageStatus = "waiting"
    if (hasEx && success && typeof dur === "number") status = "done"
    else if (hasEx && success && typeof dur !== "number") status = "running"
    else if (hasEx && !success) status = "waiting"
    const stageEntry = resolveParallelAgentLabel(agentId, partialResults)
    return {
      id: agentId,
      stage: stageEntry.title,
      stageDetail: stageEntry.detail,
      stageKind: stageEntry.kind,
      status,
      llm: resolveProviderForStage(agentId, ex?.provider, metrics?.stage_provider_calls),
      timeLabel,
      progressPct: status === "done" ? 100 : status === "running" ? 55 : 0,
    }
  }

  const used = new Set<string>()

  const pushPipeline = (pid: (typeof PIPELINE_ORDER)[number]) => {
    const ex = byId.get(pid)
    if (ex) used.add(pid)
    rows.push(mkRow(pid, ex))
  }

  pushPipeline("pipeline:master")
  pushPipeline("pipeline:decomposer")

  const parallelExecs = executions.filter((e) => {
    const aid = e.agent_id || ""
    return aid && !aid.startsWith("pipeline:")
  })
  parallelExecs.sort((a, b) => (a.agent_id || "").localeCompare(b.agent_id || ""))
  for (const ex of parallelExecs) {
    const aid = ex.agent_id || ""
    if (used.has(aid)) continue
    used.add(aid)
    rows.push(mkRow(aid, ex))
  }

  pushPipeline("pipeline:aggregator")
  pushPipeline("pipeline:supervisor")

  if (taskStatus === "running" || taskStatus === "decomposing" || taskStatus === "pending") {
    const firstOpen = rows.findIndex((r) => r.status !== "done")
    if (firstOpen >= 0) {
      const cur = rows[firstOpen]
      rows[firstOpen] = {
        ...cur,
        status: "running",
        progressPct: cur.progressPct > 0 ? cur.progressPct : 55,
      }
    }
  }

  if (taskStatus === "completed") {
    return rows.map((r) => ({
      ...r,
      status: "done" as StageStatus,
      progressPct: 100,
    }))
  }

  return rows
}

export function buildLlmContributionRows(
  metrics: ExecutionMetricsRow | undefined,
  partialResults?: Record<string, unknown> | null
): LlmContributionRow[] {
  if (!metrics) return []
  const executions = metrics.agent_executions || []
  const stageProviderCalls = metrics.stage_provider_calls ?? {}
  const hasStageProviderCalls = Object.keys(stageProviderCalls).length > 0
  const execByAgent = new Map(executions.map((ex) => [String(ex.agent_id || "").trim(), ex]))

  const map = new Map<
    string,
    {
      stageIds: string[]
      stageCallsByAgent: Record<string, number>
      seconds: number
      llmCalls: number
    }
  >()

  if (hasStageProviderCalls) {
    for (const [agentId, providerMap] of Object.entries(stageProviderCalls)) {
      if (!agentId) continue
      const ex = execByAgent.get(agentId)
      const stageSeconds =
        typeof ex?.duration_seconds === "number" ? ex.duration_seconds : 0
      const totalStageCalls = Object.values(providerMap).reduce(
        (sum, count) => sum + (Number(count) || 0),
        0
      )

      for (const [rawProvider, callCount] of Object.entries(providerMap)) {
        const calls = Number(callCount) || 0
        if (calls <= 0) continue
        const providerKey = String(rawProvider || "").trim().toUpperCase()
        const p = normalizeProviderLabel(providerKey === "DEFAULT" ? null : providerKey)
        const cur = map.get(p) || {
          stageIds: [],
          stageCallsByAgent: {},
          seconds: 0,
          llmCalls: 0,
        }
        if (!cur.stageIds.includes(agentId)) {
          cur.stageIds.push(agentId)
        }
        cur.stageCallsByAgent[agentId] = (cur.stageCallsByAgent[agentId] || 0) + calls
        const share = totalStageCalls > 0 ? calls / totalStageCalls : 1
        cur.seconds += stageSeconds * share
        map.set(p, cur)
      }
    }

    if (hasStageProviderCalls) {
      for (const ex of executions) {
        const agentId = String(ex.agent_id || "").trim()
        if (!agentId) continue
        if (!isDefaultProviderLabel(normalizeProviderLabel(ex.provider))) continue
        const cur = map.get("Default") || {
          stageIds: [],
          stageCallsByAgent: {},
          seconds: 0,
          llmCalls: 0,
        }
        if (!cur.stageIds.includes(agentId)) {
          cur.stageIds.push(agentId)
        }
        cur.seconds += typeof ex.duration_seconds === "number" ? ex.duration_seconds : 0
        const defaultCalls = stageProviderCalls[agentId]?.DEFAULT
        if (defaultCalls) {
          cur.stageCallsByAgent[agentId] =
            (cur.stageCallsByAgent[agentId] || 0) + (Number(defaultCalls) || 0)
        }
        map.set("Default", cur)
      }
    }
  } else {
    for (const ex of executions) {
      const p = normalizeProviderLabel(ex.provider)
      const cur = map.get(p) || {
        stageIds: [],
        stageCallsByAgent: {},
        seconds: 0,
        llmCalls: 0,
      }
      const agentId = String(ex.agent_id || "").trim()
      if (agentId && !cur.stageIds.includes(agentId)) {
        cur.stageIds.push(agentId)
      }
      cur.seconds += typeof ex.duration_seconds === "number" ? ex.duration_seconds : 0
      map.set(p, cur)
    }
  }

  const usage = metrics.provider_usage || {}
  for (const [k, v] of Object.entries(usage)) {
    const p = normalizeProviderLabel(k)
    const cur = map.get(p) || {
      stageIds: [],
      stageCallsByAgent: {},
      seconds: 0,
      llmCalls: 0,
    }
    cur.llmCalls += typeof v === "number" ? v : 0
    map.set(p, cur)
  }

  if (map.size === 0) return []

  const totalSec = Array.from(map.values()).reduce((a, x) => a + x.seconds, 0)
  const totalCalls = Array.from(map.values()).reduce((a, x) => a + x.llmCalls, 0)

  return Array.from(map.entries())
    .map(([provider, d]) => {
      const isDefault = isDefaultProviderLabel(provider)
      const stageEntries = stageEntriesForAgentIds(
        d.stageIds,
        partialResults,
        d.stageCallsByAgent
      )
      const stageLabels = stageEntries.map((entry) => entry.title)
      const stages = stageEntries.length
      const timeSharePct =
        totalSec > 0
          ? Math.round((d.seconds / totalSec) * 100)
          : stages > 0
            ? Math.round(100 / map.size)
            : 0
      const callSharePct =
        totalCalls > 0 ? Math.round((d.llmCalls / totalCalls) * 100) : 0
      return {
        provider,
        stages,
        stageEntries,
        stageLabels,
        seconds: Math.round(d.seconds * 100) / 100,
        llmCalls: d.llmCalls,
        timeSharePct,
        callSharePct,
        isDefault,
        shareLabel: formatLlmShareLabel(timeSharePct, callSharePct, {
          isDefault,
          llmCalls: d.llmCalls,
        }),
      }
    })
    .sort(
      (a, b) =>
        Number(b.isDefault) - Number(a.isDefault) ||
        b.seconds - a.seconds ||
        b.stages - a.stages ||
        b.llmCalls - a.llmCalls
    )
}

export function primaryLlmSharePct(row: LlmContributionRow): number {
  if (!row.isDefault && row.llmCalls > 0 && row.callSharePct > 0) return row.callSharePct
  return row.timeSharePct
}

export function formatLlmSummaryLine(rows: LlmContributionRow[]): string {
  if (rows.length === 0) return ""
  return rows
    .slice(0, 4)
    .map((r) => `${r.provider} ${primaryLlmSharePct(r)}%`)
    .join(" · ")
}

export function buildTokenShareSummary(
  metrics: ExecutionMetricsRow | undefined
): TokenShareSummary | null {
  if (!metrics) return null
  const promptTokens = Math.max(0, Number(metrics.prompt_tokens || 0))
  const completionTokens = Math.max(0, Number(metrics.completion_tokens || 0))
  const totalFromMetrics = Math.max(0, Number(metrics.total_tokens || 0))
  const totalTokens = totalFromMetrics > 0 ? totalFromMetrics : promptTokens + completionTokens
  if (totalTokens <= 0) return null
  const inputSharePct = Math.round((promptTokens / totalTokens) * 100)
  const outputSharePct = Math.max(0, 100 - inputSharePct)
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    inputSharePct,
    outputSharePct,
  }
}

export function buildAgentUsageRows(
  metrics: ExecutionMetricsRow | undefined,
  partialResults?: Record<string, unknown> | null
): AgentUsageRow[] {
  const executions = metrics?.agent_executions || []
  if (executions.length === 0) return []
  return sortAgentIds(
    executions.map((ex) => String(ex.agent_id || "agent").trim() || "agent")
  )
    .map((id) => {
      const ex = executions.find((row) => (row.agent_id || "") === id)
      if (!ex) return null
      const stageEntry = resolveParallelAgentLabel(id, partialResults)
      return {
        id,
        label: stageEntry.detail
          ? `${stageEntry.title}: ${stageEntry.detail}`
          : stageEntry.title,
        provider: resolveProviderForStage(id, ex.provider, metrics?.stage_provider_calls),
        durationSeconds:
          typeof ex.duration_seconds === "number" ? ex.duration_seconds : undefined,
        success: ex.success,
      }
    })
    .filter((row): row is AgentUsageRow => row !== null)
}
