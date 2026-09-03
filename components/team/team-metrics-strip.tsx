"use client"

import { UserPlus, Users, Zap, Activity } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatCompactNumber } from "@/lib/format-compact-number"
import type { TeamAnalyticsSummary } from "@/lib/team-analytics"

interface TeamMetricsStripProps {
  summary: TeamAnalyticsSummary
  loading?: boolean
  rangeLabel: string
}

export function TeamMetricsStrip({ summary, loading, rangeLabel }: TeamMetricsStripProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active users"
        value={loading ? "…" : formatCompactNumber(summary.activeUsers, 0)}
        subtitle={rangeLabel}
        icon={Users}
        accent="cyan"
      />
      <StatCard
        title="New this period"
        value={loading ? "…" : formatCompactNumber(summary.newThisPeriod, 0)}
        subtitle="First activity in range"
        icon={UserPlus}
        accent="amber"
      />
      <StatCard
        title="Avg sessions / user"
        value={loading ? "…" : formatCompactNumber(summary.avgSessionsPerUser, 0)}
        subtitle="Tasks + audit events"
        icon={Activity}
        accent="emerald"
      />
      <StatCard
        title="Avg tokens / user"
        value={loading ? "…" : formatCompactNumber(summary.avgTokensPerUser)}
        subtitle={rangeLabel}
        icon={Zap}
        accent="violet"
      />
    </div>
  )
}
