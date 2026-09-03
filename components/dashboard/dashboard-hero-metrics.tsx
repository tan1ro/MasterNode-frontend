"use client"

import type { LucideIcon } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import type { CardAccent } from "@/components/ui/card"

export interface DashboardHeroMetric {
  label: string
  value: string
  subtitle?: string
  loading?: boolean
  icon?: LucideIcon
  accent?: CardAccent
}

const DEFAULT_ACCENTS: CardAccent[] = ["cyan", "emerald", "amber", "violet"]

export function DashboardHeroMetric({
  label,
  value,
  subtitle,
  loading,
  icon,
  accent = "cyan",
}: DashboardHeroMetric) {
  return (
    <StatCard
      title={label}
      value={loading ? "…" : value}
      subtitle={subtitle}
      icon={icon!}
      accent={accent}
    />
  )
}

export function DashboardHeroMetrics({
  metrics,
  className,
}: {
  metrics: DashboardHeroMetric[]
  className?: string
}) {
  const valid = metrics.filter((m) => m.icon)
  if (valid.length === 0) return null

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}>
      {valid.map((m, i) => (
        <DashboardHeroMetric
          key={m.label}
          {...m}
          accent={m.accent ?? DEFAULT_ACCENTS[i % DEFAULT_ACCENTS.length]}
        />
      ))}
    </div>
  )
}
