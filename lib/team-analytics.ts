import { rangeStartCutoff, filterTasksFromCutoff, type DashboardRangePreset, presetDays } from "@/lib/dashboard-time-range"
import type { AuditEvent, Task, UsageRecord } from "@/types/api"

export type TeamRangePreset = Extract<DashboardRangePreset, "7d" | "30d" | "3m">

export const TEAM_RANGE_PRESETS: { id: TeamRangePreset; label: string; days: number }[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "3m", label: "Last 90 days", days: 90 },
]

export type TeamMemberRole = "Admin" | "Editor" | "Viewer"

export interface TeamUserRow {
  id: string
  email: string
  role: TeamMemberRole
  team: string
  sessions: number
  tokens: number
  sharePct: number
  isNewInPeriod: boolean
}

export interface TeamGroupRow {
  id: string
  name: string
  members: number
  sessions: number
  tokens: number
  sharePct: number
}

export interface TeamAnalyticsSummary {
  activeUsers: number
  newThisPeriod: number
  avgSessionsPerUser: number
  avgTokensPerUser: number
  totalTokens: number
  totalSessions: number
}

export interface TeamAnalyticsResult {
  summary: TeamAnalyticsSummary
  users: TeamUserRow[]
  teams: TeamGroupRow[]
}

export const EMPTY_TEAM_ANALYTICS: TeamAnalyticsResult = {
  summary: {
    activeUsers: 0,
    newThisPeriod: 0,
    avgSessionsPerUser: 0,
    avgTokensPerUser: 0,
    totalTokens: 0,
    totalSessions: 0,
  },
  users: [],
  teams: [],
}

function normalizePrincipal(p: string | undefined): string {
  const s = String(p || "").trim().toLowerCase()
  return s || "system"
}

function inferRole(accountType: string | undefined, principal: string): TeamMemberRole {
  if (accountType === "creator" || principal.includes("admin")) return "Admin"
  if (principal.includes("viewer")) return "Viewer"
  return "Editor"
}

function inRange(iso: string | undefined, cutoff: Date): boolean {
  if (!iso) return false
  return new Date(iso).getTime() >= cutoff.getTime()
}

export function buildTeamAnalytics(input: {
  range: TeamRangePreset
  organizationName: string
  currentUser?: { id: string; email: string; username: string; accountType?: string } | null
  tasks: Task[]
  auditEvents: AuditEvent[]
  usageRecords: UsageRecord[]
  teamFilter?: string
  roleFilter?: TeamMemberRole | "all"
}): TeamAnalyticsResult {
  const days = presetDays(input.range)
  const cutoff = rangeStartCutoff(days)
  const orgTeam = input.organizationName.trim() || "Workspace"

  const tasksInRange = filterTasksFromCutoff(input.tasks, cutoff)
  const auditsInRange = input.auditEvents.filter((e) => inRange(e.ts, cutoff))
  const usageInRange = input.usageRecords.filter((r) => inRange(r.created_at, cutoff))

  const totalTokens = usageInRange.reduce((s, r) => s + (r.tokens_used ?? 0), 0)
  const taskCount = tasksInRange.length

  type Acc = {
    email: string
    role: TeamMemberRole
    team: string
    sessions: number
    firstSeen: number
    isCurrentUser: boolean
  }

  const byUser = new Map<string, Acc>()

  const ensure = (rawId: string, email: string, role: TeamMemberRole, isCurrentUser = false) => {
    const id = normalizePrincipal(email || rawId)
    const existing = byUser.get(id)
    if (existing) {
      if (isCurrentUser) existing.isCurrentUser = true
      return existing
    }
    const row: Acc = {
      email: email || rawId,
      role,
      team: orgTeam,
      sessions: 0,
      firstSeen: Date.now(),
      isCurrentUser,
    }
    byUser.set(id, row)
    return row
  }

  const cu = input.currentUser
  if (cu?.email) {
    ensure(cu.email, cu.email, inferRole(cu.accountType, cu.email), true)
  }

  for (const ev of auditsInRange) {
    const principal = normalizePrincipal(ev.principal)
    const email = principal.includes("@") ? principal : `${principal}@workspace`
    const acc = ensure(principal, email, inferRole(undefined, principal))
    acc.sessions += 1
    const ts = ev.ts ? new Date(ev.ts).getTime() : Date.now()
    if (ts < acc.firstSeen) acc.firstSeen = ts
  }

  if (cu?.email && taskCount > 0) {
    const acc = ensure(cu.email, cu.email, inferRole(cu.accountType, cu.email), true)
    acc.sessions += taskCount
  } else if (taskCount > 0 && byUser.size === 0) {
    const acc = ensure("workspace@local", "workspace@local", "Editor")
    acc.sessions += taskCount
  }

  const periodStart = cutoff.getTime()
  let users: TeamUserRow[] = Array.from(byUser.entries()).map(([id, acc]) => ({
    id,
    email: acc.email,
    role: acc.role,
    team: acc.team,
    sessions: acc.sessions,
    tokens: 0,
    sharePct: 0,
    isNewInPeriod: acc.firstSeen >= periodStart,
  }))

  if (users.length === 0 && cu?.email) {
    users = [
      {
        id: cu.id,
        email: cu.email,
        role: inferRole(cu.accountType, cu.email),
        team: orgTeam,
        sessions: taskCount,
        tokens: 0,
        sharePct: 0,
        isNewInPeriod: true,
      },
    ]
  }

  const activeCount = users.length || 1
  const baseTokensEach = Math.floor(totalTokens / activeCount)
  let remainder = totalTokens - baseTokensEach * activeCount

  users = users.map((u, i) => {
    const extra = remainder > 0 && i === 0 ? remainder : 0
    if (i === 0) remainder = 0
    return { ...u, tokens: baseTokensEach + extra }
  })

  const totalSessions = users.reduce((s, u) => s + u.sessions, 0)
  const shareBase = totalTokens > 0 ? totalTokens : totalSessions || 1

  users = users
    .map((u) => ({
      ...u,
      sharePct:
        totalTokens > 0
          ? Math.round((u.tokens / shareBase) * 100)
          : Math.round((u.sessions / Math.max(totalSessions, 1)) * 100),
    }))
    .sort((a, b) => b.tokens - a.tokens || b.sessions - a.sessions)

  if (input.teamFilter && input.teamFilter !== "all") {
    users = users.filter((u) => u.team === input.teamFilter)
  }
  if (input.roleFilter && input.roleFilter !== "all") {
    users = users.filter((u) => u.role === input.roleFilter)
  }

  const activeUsers = users.length
  const newThisPeriod = users.filter((u) => u.isNewInPeriod).length
  const avgSessionsPerUser = activeUsers > 0 ? Math.round(totalSessions / activeUsers) : 0
  const avgTokensPerUser = activeUsers > 0 ? Math.round(totalTokens / activeUsers) : 0

  const teams: TeamGroupRow[] = [
    {
      id: orgTeam,
      name: orgTeam,
      members: activeUsers,
      sessions: totalSessions,
      tokens: totalTokens,
      sharePct: 100,
    },
  ]

  return {
    summary: {
      activeUsers,
      newThisPeriod,
      avgSessionsPerUser,
      avgTokensPerUser,
      totalTokens,
      totalSessions,
    },
    users,
    teams,
  }
}

export function exportTeamUsersCsv(users: TeamUserRow[]): void {
  const lines = [
    "User,Role,Team,Sessions,Tokens,Share of org %",
    ...users.map(
      (u) =>
        `"${u.email.replace(/"/g, '""')}",${u.role},"${u.team.replace(/"/g, '""')}",${u.sessions},${u.tokens},${u.sharePct}`
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `team-users-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
