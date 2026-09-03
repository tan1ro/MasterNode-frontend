"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMetricsStrip } from "@/components/team/team-metrics-strip"
import { TeamRangeSelector } from "@/components/team/team-range-selector"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useAuditLogs, useTasks, useUsage, TASK_LIST_MAX_LIMIT } from "@/hooks"
import { presetDays } from "@/lib/dashboard-time-range"
import {
  buildTeamAnalytics,
  EMPTY_TEAM_ANALYTICS,
  exportTeamUsersCsv,
  TEAM_RANGE_PRESETS,
  type TeamMemberRole,
  type TeamRangePreset,
} from "@/lib/team-analytics"

/** Backend ``GET /audit/logs`` allows at most 200 rows per request. */
const AUDIT_LOG_LIMIT = 200
import { formatCompactNumber } from "@/lib/format-compact-number"
import { cn } from "@/lib/utils"

const SHARE_BAR_COLORS = [
  "bg-amber",
  "bg-cyan",
  "bg-emerald",
  "bg-violet",
  "bg-orange-400",
  "bg-teal-400",
  "bg-rose-400",
  "bg-sky-400",
]

export function TeamAdoptionDashboard() {
  const { user } = useAppAuth()
  const [range, setRange] = useState<TeamRangePreset>("30d")
  const [teamFilter, setTeamFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | "all">("all")
  const [tab, setTab] = useState("users")

  const days = presetDays(range)
  const rangeLabel = TEAM_RANGE_PRESETS.find((p) => p.id === range)?.label ?? `Last ${days} days`

  const usageParams = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    return { start_date: start.toISOString(), end_date: end.toISOString(), client_channel: "web" as const }
  }, [days])

  const { data: auditData, isLoading: auditLoading, isError: auditError } = useAuditLogs({
    limit: AUDIT_LOG_LIMIT,
  })
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ limit: TASK_LIST_MAX_LIMIT })
  const { data: usage, isLoading: usageLoading } = useUsage(usageParams)

  const orgName = user?.organization.name?.trim() ?? ""

  const analytics = useMemo(() => {
    try {
      return buildTeamAnalytics({
        range,
        organizationName: orgName,
        currentUser: user
          ? {
              id: user.id,
              email: user.email,
              username: user.username,
              accountType: user.accountType,
            }
          : null,
        tasks: tasksData?.tasks ?? [],
        auditEvents: auditError ? [] : auditData?.events ?? [],
        usageRecords: usage?.records ?? [],
        teamFilter,
        roleFilter,
      })
    } catch {
      return EMPTY_TEAM_ANALYTICS
    }
  }, [
    range,
    orgName,
    user,
    tasksData?.tasks,
    auditData?.events,
    auditError,
    usage?.records,
    teamFilter,
    roleFilter,
  ])

  const loading = (auditLoading && !auditData) || (tasksLoading && !tasksData) || (usageLoading && !usage)

  const teamOptions = useMemo(() => {
    const names = new Set<string>(["all"])
    if (orgName) names.add(orgName)
    analytics.users.forEach((u) => names.add(u.team))
    return Array.from(names)
  }, [orgName, analytics.users])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <TeamRangeSelector value={range} onChange={setRange} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto shrink-0"
          onClick={() => exportTeamUsersCsv(analytics.users)}
          disabled={analytics.users.length === 0}
        >
          <Upload className="h-4 w-4 mr-2" aria-hidden />
          Export
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="space-y-1.5">
          <Label htmlFor="team-filter">Team</Label>
          <Select
            id="team-filter"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full"
          >
            <option value="all">All teams</option>
            {teamOptions
              .filter((t) => t !== "all")
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role-filter">Role</Label>
          <Select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as TeamMemberRole | "all")}
            className="w-full"
          >
            <option value="all">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </Select>
        </div>
      </div>

      {auditError ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Audit log unavailable; metrics use tasks and usage only.
        </p>
      ) : null}

      <TeamMetricsStrip summary={analytics.summary} loading={loading} rangeLabel={rangeLabel} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Top users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card noGrid className="overflow-hidden hover:translate-y-0 hover:scale-100">
            {loading ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">Loading adoption data…</p>
            ) : analytics.users.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">
                No user activity in this period. Run tasks or sign in with an organization to see metrics.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Share of org</th>
                    <th className="px-4 py-3 font-medium text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.users.map((row, i) => (
                    <tr key={row.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{row.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[140px] max-w-md">
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                SHARE_BAR_COLORS[i % SHARE_BAR_COLORS.length]
                              )}
                              style={{ width: `${Math.min(100, Math.max(0, row.sharePct))}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                            {row.sharePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatCompactNumber(row.tokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card noGrid className="overflow-hidden hover:translate-y-0 hover:scale-100">
            {loading ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">Loading…</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium">Members</th>
                    <th className="px-4 py-3 font-medium">Share of org</th>
                    <th className="px-4 py-3 font-medium text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.teams.map((row, i) => (
                    <tr key={row.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.members}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[140px] max-w-md">
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", SHARE_BAR_COLORS[i % SHARE_BAR_COLORS.length])}
                              style={{ width: `${row.sharePct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                            {row.sharePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatCompactNumber(row.tokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
