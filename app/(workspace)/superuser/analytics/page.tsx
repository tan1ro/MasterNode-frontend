"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Activity, Download, MessageSquare, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAppAuth } from "@/hooks/use-app-auth"
import { adminAnalyticsService } from "@/services/admin-analytics"
import { PageHeader } from "@/components/shared"
import { AnalyticsMetricCard } from "@/components/analytics/analytics-metric-card"
import { ExecutionsOverTimeChart } from "@/components/analytics/executions-over-time-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value || 0)
}

export default function SuperuserAnalyticsPage() {
  const { isSuperUser } = useAppAuth()
  const [days, setDays] = useState(30)

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => adminAnalyticsService.getOverview({ days }),
    enabled: isSuperUser,
  })

  const overview = (data?.overview || {}) as Record<string, unknown>
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
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <PageHeader title="Analytics" description="Superuser access required." />
        <p className="text-sm text-muted-foreground">You do not have permission to view this dashboard.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Product analytics"
        description="Privacy-minimized usage, feedback, and performance metrics."
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
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() =>
            void adminAnalyticsService.exportCsv(days).then((csv) => {
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = `analytics-${days}d.csv`
              link.click()
              URL.revokeObjectURL(url)
            })
          }
        >
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Export CSV
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={ROUTES.superuserTasks}>Back to superuser hub</Link>
        </Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading analytics…</p> : null}
      {error ? (
        <p className="text-sm text-destructive">Could not load analytics overview.</p>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsMetricCard
              title="Daily active users"
              value={String(asNumber(overview.daily_active_users))}
              icon={Users}
            />
            <AnalyticsMetricCard
              title="Conversations started"
              value={String(asNumber(overview.conversations_started))}
              icon={MessageSquare}
            />
            <AnalyticsMetricCard
              title="AI responses"
              value={String(asNumber(overview.ai_responses))}
              icon={Activity}
            />
            <AnalyticsMetricCard
              title="Positive feedback"
              value={`${asNumber(overview.positive_feedback_pct)}%`}
              icon={Activity}
              outcome="good"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ExecutionsOverTimeChart
              data={dailyUsers}
              description="Daily user activity events"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feedback summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Total feedback: {asNumber(overview.feedback_total)}</p>
                <p>Positive: {asNumber(overview.positive_feedback_pct)}%</p>
                <p>Negative: {asNumber(overview.negative_feedback_pct)}%</p>
                <p>Regenerations: {asNumber(overview.regenerations)}</p>
                <p>Copies: {asNumber(overview.copies)}</p>
                <p>Estimated API cost: ${asNumber(overview.estimated_cost_usd).toFixed(4)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent negative feedback</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Message</th>
                    <th className="py-2 pr-4 font-medium">Reasons</th>
                    <th className="py-2 pr-4 font-medium">Model</th>
                    <th className="py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.tables?.negative_feedback || []).slice(0, 20).map((row) => (
                    <tr key={String(row.id)} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-mono text-xs">{String(row.message_id || "—")}</td>
                      <td className="py-2 pr-4">{Array.isArray(row.reasons) ? row.reasons.join(", ") : "—"}</td>
                      <td className="py-2 pr-4">{String(row.model || "—")}</td>
                      <td className="py-2">{String(row.created_at || "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
