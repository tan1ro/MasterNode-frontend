"use client"

import Link from "next/link"
import { Activity } from "lucide-react"
import { Card, CardContent, type CardAccent } from "@/components/ui/card"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import type { Task } from "@/types/api"
import { getTaskShortLabel } from "@/lib/task-display"
import { taskDetailHref } from "@/lib/task-product-link"
import { ROUTES } from "@/lib/routes"
import { ProductSectionCardHeader } from "@/components/products/product-ui"

const ACTIVE_STATUSES = new Set(["pending", "decomposing", "running", "awaiting_human"])

export function isActiveTask(task: Task): boolean {
  return ACTIVE_STATUSES.has(task.status)
}

interface LiveTasksCardProps {
  tasks: Task[]
  accent?: CardAccent
}

export function LiveTasksCard({ tasks, accent = "emerald" }: LiveTasksCardProps) {
  const active = tasks.filter(isActiveTask).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const rows = active.slice(0, 8)

  return (
    <Card accent={accent} interactive={false} className="border-border/50 shadow-sm h-full">
      <ProductSectionCardHeader
        title="Live runs"
        description="Tasks in progress right now"
        icon={Activity}
        action={
          rows.length > 0 ? (
            <span className="text-sm font-mono tabular-nums text-emerald font-semibold">
              {active.length} active
            </span>
          ) : null
        }
      />
      <CardContent>
        {rows.length > 0 ? (
          <ul className="space-y-2">
            {rows.map((task) => (
              <li key={task.task_id}>
                <Link
                  href={taskDetailHref(task)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 hover:border-emerald/30 hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{getTaskShortLabel(task.task)}</p>
                    {task.product_id ? (
                      <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                        {task.product_id}
                        {task.sdlc_phase ? ` · ${task.sdlc_phase}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <TaskStatusBadge status={task.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No active runs.{" "}
            <Link href={ROUTES.chat} className="text-amber hover:underline font-medium">
              Start in Chat
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
