"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { getTaskShortLabel } from "@/lib/task-display"
import { taskDetailHref } from "@/lib/task-product-link"
import { buildProductTaskAssignment } from "@/lib/product-task-assignment"
import { formatUserDateTime, parseApiTimestamp } from "@/lib/datetime-local"
import { sdlcPhaseLabel } from "@/constants/product-sdlc"
import { ROUTES } from "@/lib/routes"
import {
  TASK_LIST_SORT_LABELS,
  type TaskListSortDir,
  type TaskListSortKey,
} from "@/lib/task-list-sort"
import { TASK_STATUS_ACCENT } from "@/lib/task-status-display"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/api"

interface TaskListViewProps {
  tasks: Task[]
  onDelete: (taskId: string, taskName: string, e: React.MouseEvent) => void
  isDeleting: boolean
  showProduct?: boolean
  sortKey: TaskListSortKey
  sortDir: TaskListSortDir
  onSortChange: (key: TaskListSortKey) => void
}

function formatTaskDate(value: string | undefined): string {
  const parsed = parseApiTimestamp(value ?? "")
  if (!parsed) return "—"
  return formatUserDateTime(value, { second: undefined })
}

function SortButton({
  label,
  active,
  sortDir,
  onClick,
  className,
}: {
  label: string
  active: boolean
  sortDir: TaskListSortDir
  onClick: () => void
  className?: string
}) {
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <Icon className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
    </button>
  )
}

export function TaskListView({
  tasks,
  onDelete,
  isDeleting,
  showProduct = false,
  sortKey,
  sortDir,
  onSortChange,
}: TaskListViewProps) {
  const gridCols = showProduct
    ? "md:grid-cols-[minmax(0,1.6fr)_6.5rem_7.5rem_7.5rem_minmax(0,0.9fr)_2.5rem]"
    : "md:grid-cols-[minmax(0,1.8fr)_6.5rem_7.5rem_7.5rem_2.5rem]"

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div
        className={cn(
          "hidden border-b border-border/60 bg-muted/25 px-4 py-2.5 text-left md:grid md:items-center md:gap-3",
          gridCols
        )}
      >
        <SortButton
          label={TASK_LIST_SORT_LABELS.name}
          active={sortKey === "name"}
          sortDir={sortDir}
          onClick={() => onSortChange("name")}
          className="justify-start"
        />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </span>
        <SortButton
          label={TASK_LIST_SORT_LABELS.created}
          active={sortKey === "created"}
          sortDir={sortDir}
          onClick={() => onSortChange("created")}
        />
        <SortButton
          label={TASK_LIST_SORT_LABELS.updated}
          active={sortKey === "updated"}
          sortDir={sortDir}
          onClick={() => onSortChange("updated")}
        />
        {showProduct ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Product
          </span>
        ) : null}
        <span className="sr-only">Actions</span>
      </div>

      <ul className="divide-y divide-border/50">
        {tasks.map((task) => {
          const title = getTaskShortLabel(task.task)
          const detailHref = taskDetailHref(task)
          const productAssignment = buildProductTaskAssignment(
            task.product_id ?? "",
            task.sdlc_phase ?? ""
          )

          return (
            <li
              key={task.task_id}
              className={cn(
                "group border-l-4 transition-colors hover:bg-muted/15",
                TASK_STATUS_ACCENT[task.status]
              )}
            >
              <div className="flex flex-col gap-3 px-4 py-3 md:hidden">
                <Link
                  href={detailHref}
                  className="text-sm font-medium leading-snug text-foreground transition-colors hover:text-amber"
                  title={task.task.trim() || undefined}
                >
                  <span className="line-clamp-2">{title}</span>
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <TaskStatusBadge status={task.status} />
                  <span>Created {formatTaskDate(task.created_at)}</span>
                  <span>Updated {formatTaskDate(task.updated_at)}</span>
                </div>
                {showProduct && productAssignment ? (
                  <Link
                    href={ROUTES.productSdlc(
                      productAssignment.product_id,
                      productAssignment.sdlc_phase
                    )}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {sdlcPhaseLabel(productAssignment.sdlc_phase)}
                  </Link>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => onDelete(task.task_id, title, event)}
                    disabled={isDeleting}
                    title="Delete task"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  "hidden items-center gap-3 px-4 py-3 md:grid",
                  gridCols
                )}
              >
                <Link
                  href={detailHref}
                  className="min-w-0 text-sm font-medium leading-snug text-foreground transition-colors hover:text-amber"
                  title={task.task.trim() || undefined}
                >
                  <span className="line-clamp-2">{title}</span>
                </Link>
                <div className="flex justify-start">
                  <TaskStatusBadge status={task.status} />
                </div>
                <time
                  className="text-xs text-muted-foreground tabular-nums"
                  dateTime={task.created_at}
                  title={formatTaskDate(task.created_at)}
                >
                  {formatTaskDate(task.created_at)}
                </time>
                <time
                  className="text-xs text-muted-foreground tabular-nums"
                  dateTime={task.updated_at}
                  title={formatTaskDate(task.updated_at)}
                >
                  {formatTaskDate(task.updated_at)}
                </time>
                {showProduct ? (
                  <div className="min-w-0 text-xs text-muted-foreground">
                    {productAssignment ? (
                      <Link
                        href={ROUTES.productSdlc(
                          productAssignment.product_id,
                          productAssignment.sdlc_phase
                        )}
                        className="truncate font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {sdlcPhaseLabel(productAssignment.sdlc_phase)}
                      </Link>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => onDelete(task.task_id, title, event)}
                    disabled={isDeleting}
                    title="Delete task"
                    className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
