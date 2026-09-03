"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { Card, CardContent, type CardAccent } from "@/components/ui/card"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import type { Task } from "@/types/api"
import { getTaskShortLabel } from "@/lib/task-display"
import { taskDetailHref } from "@/lib/task-product-link"
import { ROUTES } from "@/lib/routes"
import { ProductSectionCardHeader } from "@/components/products/product-ui"

interface RecentTasksCardProps {
  tasks: Task[]
  title?: string
  description?: string
  accent?: CardAccent
}

export function RecentTasksCard({
  tasks,
  title = "Recent tasks",
  description = "Latest completed and finished runs in this range",
  accent = "amber",
}: RecentTasksCardProps) {
  const rows = tasks.slice(0, 5)

  return (
    <Card accent={accent} interactive={false} className="border-border/50 shadow-sm h-full">
      <ProductSectionCardHeader
        title={title}
        description={description}
        icon={FileText}
        action={
          <Link href={ROUTES.tasks} className="text-sm font-medium text-amber hover:underline shrink-0">
            View all
          </Link>
        }
      />
      <CardContent>
        {rows.length > 0 ? (
          <ul className="space-y-2">
            {rows.map((task) => (
              <li key={task.task_id}>
                <Link
                  href={taskDetailHref(task)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 hover:border-amber/30 hover:bg-muted/20 transition-colors"
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
          <p className="text-sm text-muted-foreground py-4 text-center">
            No tasks in this range.{" "}
            <Link href={ROUTES.chat} className="text-amber hover:underline font-medium">
              Start in Chat
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
