import type { CSSProperties } from "react"
import type { Task } from "@/types/api"

export const TASK_STATUS_LABELS: Record<Task["status"], string> = {
  pending: "Pending",
  decomposing: "Decomposing",
  running: "Running",
  awaiting_human: "Awaiting you",
  awaiting_plan_review: "Plan review",
  completed: "Completed",
  failed: "Failed",
}

export const TASK_STATUS_ACCENT: Record<Task["status"], string> = {
  pending: "border-l-muted-foreground/40",
  decomposing: "border-l-sky",
  running: "border-l-cyan",
  awaiting_human: "border-l-amber",
  awaiting_plan_review: "border-l-amber",
  completed: "border-l-emerald",
  failed: "border-l-destructive",
}

const TASK_STATUS_WASH: Record<Task["status"], string> = {
  pending: "hsl(var(--muted-foreground) / 0.06)",
  decomposing: "hsl(var(--sky) / 0.10)",
  running: "hsl(var(--cyan) / 0.10)",
  awaiting_human: "hsl(var(--amber) / 0.08)",
  awaiting_plan_review: "hsl(var(--amber) / 0.08)",
  completed: "hsl(var(--emerald) / 0.08)",
  failed: "hsl(var(--destructive) / 0.08)",
}

const TASK_CARD_BASE = "rgba(15, 17, 21, 0.92)"

/** Full-bleed status surface for task cards (soft corner wash on dark panel). */
export function taskCardSurfaceStyle(status: Task["status"]): CSSProperties {
  const wash = TASK_STATUS_WASH[status]
  return {
    backgroundImage: `radial-gradient(110% 80% at 0% 0%, ${wash}, transparent 55%)`,
    backgroundColor: TASK_CARD_BASE,
  }
}
