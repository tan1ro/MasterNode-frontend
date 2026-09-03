"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminInboxService } from "@/services/admin-inbox"
import { metricsService } from "@/services/metrics"
import { ROUTES } from "@/lib/routes"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

function fmtNum(value: unknown, digits = 2): string {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return "—"
  return n.toFixed(digits)
}

export default function SuperuserMonitorMetricsPage() {
  const { isSuperUser } = useAppAuth()
  const enabled = useProtectedQueryEnabled() && isSuperUser

  const metricsQuery = useQuery({
    queryKey: ["admin", "pipeline-metrics"],
    queryFn: () => adminInboxService.listPipelineMetrics({ limit: 100, offset: 0 }),
    enabled,
  })

  const sloQuery = useQuery({
    queryKey: ["admin", "slo"],
    queryFn: () => metricsService.slo(),
    enabled,
  })

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Pipeline metrics" />
  }

  const tasks = metricsQuery.data?.tasks ?? []
  const slo = sloQuery.data

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="Pipeline metrics"
        description="Cross-tenant task latency, tokens, cost, and success rates."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void metricsQuery.refetch()
            void sloQuery.refetch()
          }}
        >
          Refresh
        </Button>
        <Link
          href={ROUTES.superuserMonitor}
          className="ml-auto inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Back to Monitor
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tracked tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {metricsQuery.data?.total_tasks ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Latency p95 (s)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {fmtNum(slo?.latency_p95_seconds)}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Error rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {fmtNum((slo?.error_rate ?? 0) * 100, 1)}%
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Success rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {slo?.success_rate == null ? "—" : `${fmtNum(slo.success_rate * 100, 1)}%`}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent executions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {metricsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading metrics…</p>
          ) : metricsQuery.error ? (
            <p className="text-sm text-destructive">Could not load pipeline metrics.</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No execution metrics yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Task</th>
                  <th className="py-2 pr-4 font-medium">Latency (s)</th>
                  <th className="py-2 pr-4 font-medium">Agents</th>
                  <th className="py-2 pr-4 font-medium">OK / fail</th>
                  <th className="py-2 pr-4 font-medium">Tokens</th>
                  <th className="py-2 font-medium">Cost (USD)</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((row) => (
                  <tr key={row.task_id} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">{row.task_id}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {fmtNum(row.execution_time_seconds)}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{row.total_agents ?? "—"}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {row.success_count ?? 0} / {row.failure_count ?? 0}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{row.total_tokens ?? "—"}</td>
                    <td className="py-2 tabular-nums">{fmtNum(row.cost_estimate_usd, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
