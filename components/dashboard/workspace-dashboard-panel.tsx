"use client"

import { useMemo, useState } from "react"
import { Activity, CheckCircle2, FileText, Zap } from "lucide-react"
import { DashboardHeroMetrics } from "@/components/dashboard/dashboard-hero-metrics"
import { DashboardOpsStrip } from "@/components/dashboard/dashboard-ops-strip"
import { LiveTasksCard, isActiveTask } from "@/components/dashboard/live-tasks-card"
import { RecentTasksCard } from "@/components/dashboard/recent-tasks-card"
import { TasksPerDayCard } from "@/components/dashboard/tasks-per-day-card"
import { ProductsSnapshotCard } from "@/components/dashboard/products-snapshot-card"
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card"
import { LlmUsageSplitCard } from "@/components/dashboard/llm-usage-split-card"
import { SuperuserUsersSummaryCard } from "@/components/dashboard/superuser-users-summary-card"
import { Button } from "@/components/ui/button"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useTasks, useHealth, useProducts, useMetricsList, TASK_LIST_MAX_LIMIT } from "@/hooks"
import {
  buildTasksVolumeSeries,
  filterTasksFromCutoff,
  DASHBOARD_RANGE_PRESETS,
  presetDays,
  type DashboardRangePreset,
} from "@/lib/dashboard-time-range"
import { cn } from "@/lib/utils"

const RANGE_PRESETS = DASHBOARD_RANGE_PRESETS.filter((p) =>
  (["7d", "15d", "30d"] as const).includes(p.id as "7d" | "15d" | "30d")
)

function aggregateProviderUsageFromMetrics(
  rows: Array<{ provider_usage?: Record<string, number> }>
): Array<{ name: string; value: number }> {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const usage = row.provider_usage ?? {}
    for (const [name, value] of Object.entries(usage)) {
      totals.set(name, (totals.get(name) ?? 0) + (Number(value) || 0))
    }
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
}

interface WorkspaceDashboardPanelProps {
  variant?: "page" | "embedded"
}

export function WorkspaceDashboardPanel({ variant = "page" }: WorkspaceDashboardPanelProps) {
  const { isSuperUser } = useAppAuth()
  const [range, setRange] = useState<DashboardRangePreset>("7d")
  const days = presetDays(range)

  const { data: tasksData, isLoading: tasksLoading } = useTasks({ limit: TASK_LIST_MAX_LIMIT })
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth()
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: metricsList } = useMetricsList(300, 0)

  const tasks = tasksData?.tasks ?? []
  const cutoff = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (days - 1))
    return d
  }, [days])

  const tasksInRange = useMemo(
    () => filterTasksFromCutoff(tasks, cutoff),
    [tasks, cutoff]
  )

  const volumeSeries = useMemo(
    () => buildTasksVolumeSeries(tasksInRange, days),
    [tasksInRange, days]
  )

  const llmSplit = useMemo(
    () => aggregateProviderUsageFromMetrics(metricsList?.tasks ?? []),
    [metricsList?.tasks]
  )

  const activeCount = tasks.filter(isActiveTask).length
  const completedInRange = tasksInRange.filter((t) => t.status === "completed").length
  const failedInRange = tasksInRange.filter((t) => t.status === "failed").length

  const recentFinished = useMemo(() => {
    const done = new Set(["completed", "failed", "cancelled"])
    return [...tasks]
      .filter((t) => done.has(t.status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [tasks])

  const shellClass =
    variant === "page"
      ? "container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6"
      : "space-y-6"

  return (
    <div className={cn(shellClass)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading tracking-wide text-foreground">
            Workspace dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor pipelines, tasks, and workspace health. Use the top navigation for team and account tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={range === preset.id ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <DashboardHeroMetrics
        metrics={[
          {
            label: "Active runs",
            value: String(activeCount),
            subtitle: "In progress now",
            loading: tasksLoading,
            icon: Activity,
            accent: "emerald",
          },
          {
            label: "Runs in range",
            value: String(tasksInRange.length),
            subtitle: RANGE_PRESETS.find((p) => p.id === range)?.label ?? `Last ${days} days`,
            loading: tasksLoading,
            icon: FileText,
            accent: "cyan",
          },
          {
            label: "Completed",
            value: String(completedInRange),
            subtitle: "Finished in range",
            loading: tasksLoading,
            icon: CheckCircle2,
            accent: "amber",
          },
          {
            label: "Failed",
            value: String(failedInRange),
            subtitle: "Needs attention",
            loading: tasksLoading,
            icon: Zap,
            accent: "violet",
          },
        ]}
      />

      <DashboardOpsStrip
        health={health}
        isLoading={healthLoading}
        error={healthError}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <LiveTasksCard tasks={tasks} />
            <RecentTasksCard tasks={recentFinished} />
          </div>
          <TasksPerDayCard data={volumeSeries} />
        </div>
        <div className="space-y-4">
          <QuickActionsCard />
          <ProductsSnapshotCard products={products} isLoading={productsLoading} />
          <LlmUsageSplitCard data={llmSplit} />
          {isSuperUser ? <SuperuserUsersSummaryCard /> : null}
        </div>
      </div>
    </div>
  )
}
