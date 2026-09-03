"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { AnalyticsMetricCard } from "@/components/analytics/analytics-metric-card"
import { ExecutionsOverTimeChart } from "@/components/analytics/executions-over-time-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAnalyticsService } from "@/services/admin-analytics"
import { metricsService } from "@/services/metrics"
import { ROUTES } from "@/lib/routes"
import { Activity, MessageSquare, Users } from "lucide-react"

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value || 0)
}

export default function SuperuserMonitorAnalyticsPage() {
  const { isSuperUser } = useAppAuth()
  const [days, setDays] = useState(30)

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "monitor", days],
    queryFn: () => adminAnalyticsService.getOverview({ days }),
    enabled: isSuperUser,
  })

  const sloQuery = useQuery({
    queryKey: ["admin", "slo", "monitor-analytics"],
    queryFn: () => metricsService.slo(),
    enabled: isSuperUser,
  })

  const dailyUsers = useMemo(
    () =>
      (data?.charts?.daily_users || []).map((row) => ({
        day: String(row.date || ""),
        executions: asNumber(row.count),
        failedTasks: 0,
      })),
    [data]
  )

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Execution analytics" />
  }

  const overview = (data?.overview || {}) as Record<string, unknown>
  const slo = sloQuery.data

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="Execution analytics"
        description="SLO snapshot and product execution trends over time."
      />

      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((option) => (
          <Button
            key={option}
            size="sm"
            variant={days === option ? "default" : "outline"}
            onClick={() => setDays(option)}
          >
            Last {option} days
          </Button>
        ))}
        <Link
          href={ROUTES.superuserAnalytics}
          className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Full product analytics
        </Link>
        <Link
          href={ROUTES.superuserMonitor}
          className="ml-auto inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Back to Monitor
        </Link>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading analytics…</p> : null}
      {error ? (
        <p className="text-sm text-destructive">Could not load execution analytics.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard
          title="Daily active users"
          value={String(asNumber(overview.daily_active_users))}
          icon={Users}
        />
        <AnalyticsMetricCard
          title="Conversations"
          value={String(asNumber(overview.conversations_started))}
          icon={MessageSquare}
        />
        <AnalyticsMetricCard
          title="AI responses"
          value={String(asNumber(overview.ai_responses))}
          icon={Activity}
        />
        <AnalyticsMetricCard
          title="SLO latency"
          value={slo?.latency_ok === false ? "Breach" : slo?.latency_ok ? "OK" : "—"}
          icon={Activity}
          outcome={slo?.latency_ok === false ? "bad" : "good"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExecutionsOverTimeChart data={dailyUsers} description="Daily activity events" />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLO snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Samples: {slo?.task_samples ?? "—"}</p>
            <p>Latency p95: {slo?.latency_p95_seconds?.toFixed?.(2) ?? "—"}s</p>
            <p>Target: {slo?.latency_target_seconds ?? "—"}s</p>
            <p>Error rate: {slo ? `${(slo.error_rate * 100).toFixed(2)}%` : "—"}</p>
            <p>Error budget: {slo?.error_budget_ok == null ? "—" : slo.error_budget_ok ? "OK" : "Breach"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
