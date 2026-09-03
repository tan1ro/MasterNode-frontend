import { cn } from "@/lib/utils"
import { TASK_STATUS_LABELS } from "@/lib/task-status-display"
import type { Task } from "@/types/api"

type TaskStatus = Task["status"]

/** Outline pills — matches task list card screenshots (RUNNING cyan / COMPLETED green). */
const STATUS_STYLES: Record<TaskStatus, string> = {
  completed:
    "border-emerald/55 bg-transparent text-emerald shadow-[0_0_0_1px_rgba(46,204,132,0.08)]",
  running:
    "border-cyan/55 bg-transparent text-cyan shadow-[0_0_0_1px_rgba(34,208,200,0.08)]",
  decomposing:
    "border-sky/50 bg-transparent text-sky",
  awaiting_human:
    "border-amber/50 bg-transparent text-amber",
  awaiting_plan_review:
    "border-amber/50 bg-transparent text-amber",
  failed:
    "border-destructive/50 bg-transparent text-destructive",
  pending:
    "border-white/15 bg-transparent text-muted-foreground",
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
  /** Show raw status key instead of friendly label */
  mono?: boolean
}

export function TaskStatusBadge({ status, className, mono }: TaskStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5",
        "text-[10px] font-semibold uppercase tracking-[0.08em]",
        STATUS_STYLES[status],
        className
      )}
    >
      {mono ? status : TASK_STATUS_LABELS[status]}
    </span>
  )
}
