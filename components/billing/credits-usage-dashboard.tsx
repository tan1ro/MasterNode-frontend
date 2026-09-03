"use client"

import { useMemo, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { TrafficSourceTabs } from "@/components/billing/traffic-source-tabs"
import { useUsage, useMetricsList, useTasks, TASK_LIST_MAX_LIMIT } from "@/hooks"
import { useBillingSubscription } from "@/hooks/use-billing"
import { promptQuotaFromApi } from "@/lib/plan-usage"
import { cn } from "@/lib/utils"
import {
  buildStackedCreditsByChannel,
  buildStackedCreditsByModel,
  CREDITS_CHART_COLORS,
  CREDITS_USAGE_RANGES,
  creditsRangeDays,
  downloadTextFile,
  exportUsageRecordsCsv,
  formatComputeShort,
  formatTokensShort,
  listProviderKeysFromMetrics,
  usageParamsForCreditsRange,
  providerLabel,
  type CreditsGroupBy,
  type CreditsUsageRange,
} from "@/lib/billing-usage-analytics"
import { useAppearancePrefs } from "@/hooks/use-appearance-prefs"
import type { ClientChannel } from "@/types/api"

interface CreditsUsageDashboardProps {
  variant: "creator" | "business"
  canSwitchChannel?: boolean
  availableCreditsUsd?: number
  className?: string
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-heading font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

export function CreditsUsageDashboard({
  variant,
  canSwitchChannel = false,
  availableCreditsUsd,
  className,
}: CreditsUsageDashboardProps) {
  const { showTokenCostHints } = useAppearancePrefs()
  const [range, setRange] = useState<CreditsUsageRange>("30d")
  const [groupBy, setGroupBy] = useState<CreditsGroupBy>("model")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [clientChannel, setClientChannel] = useState<ClientChannel>("web")

  const effectiveChannel: ClientChannel | undefined =
    variant === "creator" && !canSwitchChannel
      ? "web"
      : canSwitchChannel || variant === "business"
        ? clientChannel
        : undefined

  const usageParams = useMemo(
    () =>
      usageParamsForCreditsRange(
        range,
        effectiveChannel
      ),
    [range, effectiveChannel]
  )

  const { data: usage, isLoading: usageLoading } = useUsage(usageParams)
  const { data: metricsList, isLoading: metricsLoading } = useMetricsList(500, 0)
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ limit: TASK_LIST_MAX_LIMIT })
  const { data: billing } = useBillingSubscription()

  const rangeDays = creditsRangeDays(range)
  const records = usage?.records ?? []
  const summary = usage?.summary ?? {}
  const metricsRows = metricsList?.tasks ?? []
  const tasks = tasksData?.tasks ?? []

  const providerKeys = useMemo(() => listProviderKeysFromMetrics(metricsRows), [metricsRows])

  const chart = useMemo(() => {
    if (groupBy === "channel") {
      return buildStackedCreditsByChannel({
        records,
        rangeDays,
        clientChannel: effectiveChannel,
      })
    }
    return buildStackedCreditsByModel({
      tasks,
      metricsRows,
      rangeDays,
      clientChannel: effectiveChannel,
      modelFilter,
    })
  }, [groupBy, records, rangeDays, effectiveChannel, tasks, metricsRows, modelFilter])

  const quota = promptQuotaFromApi(billing?.prompt_quota)
  const isLoading = usageLoading || metricsLoading || tasksLoading

  const handleExport = () => {
    const csv = exportUsageRecordsCsv(records)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextFile(`masternode-usage-${stamp}.csv`, csv)
  }

  const title = variant === "creator" ? "Chat credits" : "Usage credits"
  const description =
    variant === "creator"
      ? "Monitor token consumption over time, grouped by model or in-app vs API traffic."
      : "Monitor API and in-app token usage over time, grouped by model or traffic source."

  const totalTokens = summary.total_tokens ?? 0
  const totalTasks = summary.total_tasks ?? records.length
  const totalCost = summary.total_cost_usd ?? 0
  const computeMs = summary.total_compute_time_ms ?? 0

  return (
    <section id="usage" className={cn("space-y-4 scroll-mt-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold font-heading tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-border/60 bg-muted/20 p-0.5">
            {CREDITS_USAGE_RANGES.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  range === preset.id
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setRange(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-card/30">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Group by
                </p>
                <div className="inline-flex rounded-md border border-border/60 bg-muted/20 p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-8 rounded-sm px-3 text-xs",
                      groupBy === "model"
                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setGroupBy("model")}
                  >
                    By model
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-8 rounded-sm px-3 text-xs",
                      groupBy === "channel"
                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setGroupBy("channel")}
                  >
                    By channel
                  </Button>
                </div>
              </div>

              {groupBy === "model" ? (
                <div className="space-y-1.5 min-w-[10rem]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Model
                  </p>
                  <Select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="all">All models</option>
                    {providerKeys.map((key) => (
                      <option key={key} value={key}>
                        {providerLabel(key)}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              {(canSwitchChannel || variant === "business") ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Channel
                  </p>
                  <TrafficSourceTabs value={clientChannel} onChange={setClientChannel} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-3 sm:p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {groupBy === "model" ? "Tokens by model" : "Tokens by channel"}
            </p>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : chart.data.length > 0 && chart.seriesKeys.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chart.data} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatTokensShort}
                      width={48}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatTokensShort(value),
                        chart.seriesLabels[name] ?? name,
                      ]}
                    />
                    {chart.seriesKeys.map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="tokens"
                        fill={CREDITS_CHART_COLORS[index % CREDITS_CHART_COLORS.length]}
                        name={key}
                        radius={index === chart.seriesKeys.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                  {chart.seriesKeys.map((key, index) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CREDITS_CHART_COLORS[index % CREDITS_CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-muted-foreground">
                        {chart.seriesLabels[key] ?? key}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No usage data in this range yet. Run a task to populate the chart.
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {showTokenCostHints ? (
              <MetricTile label="Total tokens" value={formatTokensShort(totalTokens)} />
            ) : null}
            <MetricTile label="Tasks" value={String(totalTasks)} />
            {variant === "creator" ? (
              <MetricTile
                label="Quota used"
                value={
                  quota?.isUnlimited
                    ? "Unlimited"
                    : quota?.percent != null
                      ? `${quota.percent}%`
                      : "—"
                }
              />
            ) : (
              <MetricTile
                label="Available credits"
                value={
                  availableCreditsUsd != null ? `$${availableCreditsUsd.toFixed(2)}` : "—"
                }
              />
            )}
            {showTokenCostHints ? (
              <MetricTile
                label={variant === "business" ? "Est. cost" : "Compute time"}
                value={
                  variant === "business"
                    ? `$${totalCost.toFixed(totalCost >= 1 ? 2 : 4)}`
                    : formatComputeShort(computeMs)
                }
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
