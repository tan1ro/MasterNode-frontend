"use client"

import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { LlmProviderLogo, formatProviderDisplayName } from "@/components/tasks/llm-provider-logo"
import { useTaskMetrics, taskMetricsFetchEnabled } from "@/hooks/use-metrics"
import { cn } from "@/lib/utils"
import type { ExecutionMetricsRow, Task } from "@/types/api"

interface UsageShare {
  provider: string
  name: string
  pct: number
  calls: number
  isDefault: boolean
}

const DEFAULT_KEY = "DEFAULT"

/**
 * Attribute usage by actual LLM API calls. Even under auto-route the backend
 * records the resolved provider per call (stage_provider_calls / provider_usage),
 * so this breaks the "auto" work down into the real models that handled it.
 */
function buildUsageShares(metrics: ExecutionMetricsRow | undefined): UsageShare[] {
  if (!metrics) return []

  const callsByProvider = new Map<string, number>()
  const add = (rawProvider: string, count: number) => {
    const n = Number(count) || 0
    if (n <= 0) return
    const key = String(rawProvider || "").trim().toUpperCase() || DEFAULT_KEY
    callsByProvider.set(key, (callsByProvider.get(key) || 0) + n)
  }

  // Prefer per-stage attribution; it carries the resolved provider per call.
  const stageProviderCalls = metrics.stage_provider_calls ?? {}
  let hasStageCalls = false
  for (const perStage of Object.values(stageProviderCalls)) {
    if (!perStage || typeof perStage !== "object") continue
    for (const [provider, count] of Object.entries(perStage)) {
      add(provider, count as number)
      hasStageCalls = true
    }
  }

  // Fall back to the flat provider tally when stage attribution is absent.
  if (!hasStageCalls) {
    for (const [provider, count] of Object.entries(metrics.provider_usage ?? {})) {
      add(provider, count as number)
    }
  }

  if (callsByProvider.size === 0) return []

  const total = Array.from(callsByProvider.values()).reduce((sum, n) => sum + n, 0)
  if (total <= 0) return []

  return Array.from(callsByProvider.entries())
    .map(([provider, calls]) => {
      const isDefault = provider === DEFAULT_KEY
      return {
        provider,
        name: formatProviderDisplayName(provider),
        pct: Math.round((calls / total) * 100),
        calls,
        isDefault,
      }
    })
    .filter((share) => share.pct > 0)
    .sort(
      (a, b) =>
        Number(a.isDefault) - Number(b.isDefault) || b.calls - a.calls
    )
}

export function CreatorTaskLlmUsage({
  task,
  className,
}: {
  task: Task
  className?: string
}) {
  const poll =
    task.status === "running" ||
    task.status === "decomposing"

  const { data, isLoading } = useTaskMetrics(
    task.task_id,
    taskMetricsFetchEnabled(task.status),
    poll ? 2000 : false
  )

  const shares = useMemo(() => {
    const built = buildUsageShares(data?.metrics)
    if (built.length > 0) return built
    // Always show something — default to auto-route at 100%.
    return [
      {
        provider: DEFAULT_KEY,
        name: formatProviderDisplayName(DEFAULT_KEY),
        pct: 100,
        calls: 0,
        isDefault: true,
      },
    ]
  }, [data?.metrics])

  return (
    <div className={cn("creator-task-llm-usage", className)}>
      <p className="creator-task-llm-usage-title">AI models used</p>
      {isLoading && !data?.metrics ? (
        <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Measuring…
        </div>
      ) : (
        <ul className="creator-task-llm-usage-list">
          {shares.map((share) => (
            <li key={share.provider} className="creator-task-llm-usage-row">
              <div className="creator-task-llm-usage-head">
                <LlmProviderLogo
                  provider={share.provider}
                  className="h-6 w-6 shrink-0"
                />
                <span className="creator-task-llm-usage-name">{share.name}</span>
                <span className="creator-task-llm-usage-pct">{share.pct}%</span>
              </div>
              <div className="creator-task-llm-usage-bar">
                <span
                  className="creator-task-llm-usage-bar-fill"
                  style={{ width: `${Math.max(share.pct, 3)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
