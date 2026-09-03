import type { ClientChannel, ExecutionMetricsRow, Task, UsageRecord } from "@/types/api"

export type CreditsUsageRange = "7d" | "30d" | "90d"
export type CreditsGroupBy = "model" | "channel"

export const CREDITS_USAGE_RANGES: { id: CreditsUsageRange; label: string; days: number }[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
]

export const CREDITS_CHART_COLORS = [
  "#F4A429",
  "#22D0C8",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
  "#EAB308",
  "#64748B",
  "#EF4444",
  "#14B8A6",
]

const DEFAULT_PROVIDER_KEY = "DEFAULT"

export function creditsRangeDays(range: CreditsUsageRange): number {
  return CREDITS_USAGE_RANGES.find((r) => r.id === range)?.days ?? 30
}

export function usageParamsForCreditsRange(
  range: CreditsUsageRange,
  clientChannel?: ClientChannel
): { start_date: string; end_date: string; client_channel?: ClientChannel } {
  const days = creditsRangeDays(range)
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    ...(clientChannel ? { client_channel: clientChannel } : {}),
  }
}

/** Compact token counts for chart axis and tooltips (e.g. 1.2M, 850K). */
export function formatTokensShort(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0"
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    const rounded = Math.round(m * 10) / 10
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    return `${str}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    const rounded = Math.round(k * 10) / 10
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    return `${str}K`
  }
  return n.toLocaleString()
}

export function formatComputeShort(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0s"
  const sec = ms / 1000
  if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`
  if (sec >= 60) return `${Math.round(sec / 60)}m`
  return `${Math.round(sec)}s`
}

function dayKey(iso: string): string | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function formatDayLabel(dayKeyStr: string): string {
  const d = new Date(`${dayKeyStr}T12:00:00`)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function providerCallCounts(metrics: ExecutionMetricsRow): Map<string, number> {
  const counts = new Map<string, number>()
  const add = (raw: string, n: number) => {
    const c = Number(n) || 0
    if (c <= 0) return
    const key = String(raw || "").trim().toUpperCase() || DEFAULT_PROVIDER_KEY
    counts.set(key, (counts.get(key) ?? 0) + c)
  }

  let hasStage = false
  for (const perStage of Object.values(metrics.stage_provider_calls ?? {})) {
    if (!perStage || typeof perStage !== "object") continue
    for (const [provider, count] of Object.entries(perStage)) {
      add(provider, count as number)
      hasStage = true
    }
  }
  if (!hasStage) {
    for (const [provider, count] of Object.entries(metrics.provider_usage ?? {})) {
      add(provider, count as number)
    }
  }
  return counts
}

function tokensByProvider(metrics: ExecutionMetricsRow): Map<string, number> {
  const total = metrics.total_tokens ?? 0
  if (total <= 0) return new Map()

  const calls = providerCallCounts(metrics)
  const callTotal = Array.from(calls.values()).reduce((s, n) => s + n, 0)
  if (callTotal <= 0) {
    return new Map([[DEFAULT_PROVIDER_KEY, total]])
  }

  const out = new Map<string, number>()
  for (const [provider, count] of calls) {
    out.set(provider, Math.round((total * count) / callTotal))
  }
  return out
}

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  OPENAI: "OpenAI",
  GEMINI: "Gemini",
  ANTHROPIC: "Claude",
  MISTRAL: "Mistral",
  GROQ: "Groq",
  DEEPSEEK: "DeepSeek",
  COHERE: "Cohere",
  OPENROUTER: "OpenRouter",
  GROK: "Grok",
  DEFAULT: "Auto-route",
}

export function providerLabel(providerKey: string): string {
  if (providerKey === DEFAULT_PROVIDER_KEY) return "Auto / mixed"
  const key = String(providerKey || "").trim().toUpperCase()
  return (
    PROVIDER_DISPLAY_NAMES[key] ??
    (key ? key.charAt(0) + key.slice(1).toLowerCase() : "Unknown")
  )
}

export interface StackedCreditsChart {
  data: Array<Record<string, number | string>>
  seriesKeys: string[]
  seriesLabels: Record<string, string>
}

function emptyChart(): StackedCreditsChart {
  return { data: [], seriesKeys: [], seriesLabels: {} }
}

function finalizeStackedRows(
  byDay: Map<string, Map<string, number>>,
  labelForKey: (key: string) => string
): StackedCreditsChart {
  const seriesSet = new Set<string>()
  for (const day of byDay.values()) {
    for (const key of day.keys()) seriesSet.add(key)
  }
  const seriesKeys = Array.from(seriesSet).sort((a, b) => {
    const totalA = Array.from(byDay.values()).reduce((s, m) => s + (m.get(a) ?? 0), 0)
    const totalB = Array.from(byDay.values()).reduce((s, m) => s + (m.get(b) ?? 0), 0)
    return totalB - totalA
  })

  const seriesLabels: Record<string, string> = {}
  for (const key of seriesKeys) {
    seriesLabels[key] = labelForKey(key)
  }

  const data = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, buckets]) => {
      const row: Record<string, number | string> = {
        dayKey: key,
        date: formatDayLabel(key),
      }
      for (const series of seriesKeys) {
        row[series] = buckets.get(series) ?? 0
      }
      return row
    })

  return { data, seriesKeys, seriesLabels }
}

export function buildStackedCreditsByModel(input: {
  tasks: Task[]
  metricsRows: ExecutionMetricsRow[]
  rangeDays: number
  clientChannel?: ClientChannel
  modelFilter?: string | "all"
}): StackedCreditsChart {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (input.rangeDays - 1))

  const metricsByTask = new Map(input.metricsRows.map((m) => [m.task_id, m]))
  const byDay = new Map<string, Map<string, number>>()

  for (const task of input.tasks) {
    if (input.clientChannel && task.client_channel && task.client_channel !== input.clientChannel) {
      continue
    }
    const created = new Date(task.created_at)
    if (Number.isNaN(created.getTime()) || created.getTime() < cutoff.getTime()) continue

    const metrics = metricsByTask.get(task.task_id)
    if (!metrics) continue

    const split = tokensByProvider(metrics)
    if (split.size === 0) continue

    const dk = dayKey(task.created_at)
    if (!dk) continue

    for (const [provider, tokens] of split) {
      if (input.modelFilter && input.modelFilter !== "all" && provider !== input.modelFilter) continue
      if (tokens <= 0) continue
      const day = byDay.get(dk) ?? new Map<string, number>()
      day.set(provider, (day.get(provider) ?? 0) + tokens)
      byDay.set(dk, day)
    }
  }

  if (byDay.size === 0) return emptyChart()
  return finalizeStackedRows(byDay, providerLabel)
}

export function buildStackedCreditsByChannel(input: {
  records: UsageRecord[]
  rangeDays: number
  clientChannel?: ClientChannel
}): StackedCreditsChart {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (input.rangeDays - 1))

  const byDay = new Map<string, Map<string, number>>()

  for (const record of input.records) {
    if (input.clientChannel && record.client_channel && record.client_channel !== input.clientChannel) {
      continue
    }
    const created = new Date(record.created_at)
    if (Number.isNaN(created.getTime()) || created.getTime() < cutoff.getTime()) continue

    const dk = dayKey(record.created_at)
    if (!dk) continue

    const channel = record.client_channel === "api" ? "api" : "web"
    const tokens = record.tokens_used ?? 0
    if (tokens <= 0) continue

    const day = byDay.get(dk) ?? new Map<string, number>()
    day.set(channel, (day.get(channel) ?? 0) + tokens)
    byDay.set(dk, day)
  }

  const labelForKey = (key: string) => (key === "api" ? "API" : "In-App")
  if (byDay.size === 0) return emptyChart()
  return finalizeStackedRows(byDay, labelForKey)
}

export function listProviderKeysFromMetrics(metricsRows: ExecutionMetricsRow[]): string[] {
  const keys = new Set<string>()
  for (const row of metricsRows) {
    for (const provider of providerCallCounts(row).keys()) {
      keys.add(provider)
    }
  }
  return Array.from(keys).sort((a, b) => providerLabel(a).localeCompare(providerLabel(b)))
}

export function exportUsageRecordsCsv(records: UsageRecord[]): string {
  const header = ["date", "task_id", "tokens", "cost_usd", "compute_ms", "channel"]
  const lines = [header.join(",")]
  for (const r of records) {
    lines.push(
      [
        r.created_at,
        r.task_id ?? "",
        String(r.tokens_used ?? 0),
        String(r.cost_usd ?? 0),
        String(r.compute_time_ms ?? 0),
        r.client_channel ?? "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
  }
  return lines.join("\n")
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
