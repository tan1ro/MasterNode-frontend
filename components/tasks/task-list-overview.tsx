"use client"

import { Activity, CheckCircle2, ClipboardList, AlertCircle, UserCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskStatusFilter } from "@/lib/task-list-filters"

interface FilterChip {
  id: TaskStatusFilter
  label: string
  count: number
  icon: LucideIcon
  accent: string
  activeAccent: string
}

interface TaskListOverviewProps {
  counts: {
    total: number
    active: number
    completed: number
    failed: number
    review: number
  }
  statusFilter: TaskStatusFilter
  onStatusFilterChange: (filter: TaskStatusFilter) => void
  filteredCount: number
}

export function TaskListOverview({
  counts,
  statusFilter,
  onStatusFilterChange,
  filteredCount,
}: TaskListOverviewProps) {
  const chips: FilterChip[] = [
    {
      id: "all",
      label: "All",
      count: counts.total,
      icon: ClipboardList,
      accent: "border-border/60 bg-muted/20 text-muted-foreground",
      activeAccent: "border-foreground/25 bg-foreground/5 text-foreground ring-1 ring-foreground/10",
    },
    {
      id: "active",
      label: "Active",
      count: counts.active,
      icon: Activity,
      accent: "border-cyan/25 bg-cyan/5 text-cyan",
      activeAccent: "border-cyan/50 bg-cyan/15 text-cyan ring-1 ring-cyan/25",
    },
    {
      id: "review",
      label: "Needs review",
      count: counts.review,
      icon: UserCheck,
      accent: "border-amber/25 bg-amber/5 text-amber",
      activeAccent: "border-amber/50 bg-amber/15 text-amber ring-1 ring-amber/25",
    },
    {
      id: "completed",
      label: "Completed",
      count: counts.completed,
      icon: CheckCircle2,
      accent: "border-emerald/25 bg-emerald/5 text-emerald",
      activeAccent: "border-emerald/50 bg-emerald/15 text-emerald ring-1 ring-emerald/25",
    },
    {
      id: "failed",
      label: "Failed",
      count: counts.failed,
      icon: AlertCircle,
      accent: "border-destructive/25 bg-destructive/5 text-destructive",
      activeAccent: "border-destructive/50 bg-destructive/15 text-destructive ring-1 ring-destructive/25",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const selected = statusFilter === chip.id
          const Icon = chip.icon
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onStatusFilterChange(chip.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                selected ? chip.activeAccent : chip.accent
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              <span>{chip.label}</span>
              <span
                className={cn(
                  "tabular-nums rounded-md px-1.5 py-0.5 text-xs font-mono font-semibold",
                  selected ? "bg-background/60" : "bg-background/40"
                )}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>
      {statusFilter !== "all" ? (
        <p className="text-xs text-muted-foreground">
          Showing {filteredCount} {filteredCount === 1 ? "task" : "tasks"} in this view
        </p>
      ) : null}
    </div>
  )
}
