import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Outcome = "good" | "bad" | "neutral"

interface AnalyticsMetricCardProps {
  title: string
  value: string
  /** Optional comparison line; omitted when not provided */
  delta?: string
  context?: string
  /** Whether the change vs last week is favorable for the user */
  outcome?: Outcome
  /** e.g. selected time range label */
  subtitle?: string
  icon: LucideIcon
}

const OUTLINE: Record<Outcome, string> = {
  good: "text-emerald",
  bad: "text-rose-500 dark:text-rose-400",
  neutral: "text-muted-foreground",
}

export function AnalyticsMetricCard({
  title,
  value,
  delta,
  context = "vs last week",
  outcome = "good",
  subtitle,
  icon: Icon,
}: AnalyticsMetricCardProps) {
  return (
    <Card accent="amber">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-snug">{title}</CardTitle>
        <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-heading font-bold text-foreground tabular-nums">{value}</div>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        {delta != null && delta !== "" && (
          <p className={cn("mt-1 text-xs font-mono tabular-nums", OUTLINE[outcome])}>
            {delta} {context}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
