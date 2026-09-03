"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ChevronRight, Trash2, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { CustomAgentsBadges } from "@/components/tasks/custom-agents-badges"
import { useTaskMetrics } from "@/hooks/use-metrics"
import { buildLlmContributionRows } from "@/lib/task-stage-metrics"
import { taskCardSurfaceStyle } from "@/lib/task-status-display"
import { isActiveTaskStatus } from "@/lib/task-list-filters"
import type { Task } from "@/types/api"
import { getTaskShortLabel } from "@/lib/task-display"
import { taskDetailHref } from "@/lib/task-product-link"
import { sdlcPhaseLabel } from "@/constants/product-sdlc"
import { ROUTES } from "@/lib/routes"
import { buildProductTaskAssignment } from "@/lib/product-task-assignment"
import { formatUserDateTime, parseApiTimestamp } from "@/lib/datetime-local"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onDelete: (taskId: string, taskName: string, e: React.MouseEvent) => void
  isDeleting: boolean
}

function agentProgressCount(task: Task): number {
  if (!task.partial_results || typeof task.partial_results !== "object") return 0
  return Object.keys(task.partial_results).length
}

export function TaskCard({ task, onDelete, isDeleting }: TaskCardProps) {
  const title = getTaskShortLabel(task.task)
  const metricsEnabled =
    task.status === "completed" || task.status === "running" || task.status === "decomposing"

  const pollMs = task.status === "running" || task.status === "decomposing" ? 3000 : false

  const { data: metricsPayload, isSuccess } = useTaskMetrics(task.task_id, metricsEnabled, pollMs)

  const llmRows = useMemo(() => {
    if (!isSuccess || !metricsPayload?.metrics) return []
    return buildLlmContributionRows(metricsPayload.metrics, task.partial_results)
  }, [isSuccess, metricsPayload, task.partial_results])

  const productAssignment = buildProductTaskAssignment(
    task.product_id ?? "",
    task.sdlc_phase ?? ""
  )
  const detailHref = taskDetailHref(task)
  const agentsDone = agentProgressCount(task)
  const isActive = isActiveTaskStatus(task.status)
  const createdAt = parseApiTimestamp(task.created_at)
  const relativeCreated = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : null
  const progressPct =
    agentsDone > 0 ? Math.min(agentsDone * 12 + 15, 92) : null

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.08]",
        "bg-[#0F1115]/90 shadow-none transition-colors duration-200",
        "hover:border-white/[0.14]"
      )}
      style={taskCardSurfaceStyle(task.status)}
    >
      <div className="relative z-[1] flex flex-col gap-3 p-5 sm:p-6">
        {/* Header: title + status + delete */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={detailHref}
            className="group/link min-w-0 flex-1"
            title={task.task.trim() || undefined}
          >
            <div className="flex items-start gap-1.5">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground sm:text-base">
                {title}
              </h3>
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/45 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-muted-foreground" />
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onDelete(task.task_id, title, e)}
              disabled={isDeleting}
              title="Delete task"
              className="h-8 w-8 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timestamp (+ optional product) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
          {relativeCreated ? (
            <span title={formatUserDateTime(task.created_at, { second: undefined })}>
              {relativeCreated}
            </span>
          ) : (
            <span>—</span>
          )}
          {productAssignment ? (
            <>
              <span className="text-muted-foreground/35">·</span>
              <span>
                <Link
                  href={ROUTES.productDetail(productAssignment.product_id)}
                  className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Product
                </Link>
                {" · "}
                <Link
                  href={ROUTES.productSdlc(
                    productAssignment.product_id,
                    productAssignment.sdlc_phase
                  )}
                  className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {sdlcPhaseLabel(productAssignment.sdlc_phase)}
                </Link>
              </span>
            </>
          ) : null}
        </div>

        <CustomAgentsBadges templateIds={task.template_ids} compact />

        {/* Running: progress bar */}
        {isActive ? (
          <div className="space-y-2 pt-0.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn(
                  "h-full rounded-full bg-cyan shadow-[0_0_12px_rgba(34,208,200,0.45)] transition-all duration-700",
                  agentsDone === 0 && "w-1/3 animate-pulse bg-cyan/75"
                )}
                style={progressPct != null ? { width: `${progressPct}%` } : undefined}
              />
            </div>
            <p className="text-[12px] text-muted-foreground">
              {agentsDone > 0
                ? `${agentsDone} agent${agentsDone === 1 ? "" : "s"} reported progress`
                : "Pipeline starting…"}
            </p>
          </div>
        ) : null}

        {/* Completed / idle: agents contributed */}
        {!isActive && agentsDone > 0 ? (
          <div className="flex items-center gap-2 text-[13px] text-emerald">
            <Users className="h-3.5 w-3.5 shrink-0 opacity-90" />
            <span>
              {agentsDone} agent{agentsDone === 1 ? "" : "s"} contributed
            </span>
          </div>
        ) : null}

        {/* Model share pills */}
        {llmRows.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {llmRows.slice(0, 4).map((row, i) => (
              <span
                key={row.provider}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-white/[0.08]",
                  "bg-white/[0.04] px-2.5 py-1 text-[11px] tracking-wide"
                )}
                title={row.shareLabel}
              >
                <span className="font-semibold uppercase text-foreground/95">{row.provider}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    i === 0 ? "text-cyan" : "text-muted-foreground"
                  )}
                >
                  {row.timeSharePct}%
                </span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
