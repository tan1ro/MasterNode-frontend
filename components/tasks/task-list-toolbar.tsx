"use client"

import { LayoutGrid, List, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TASK_LIST_SORT_OPTIONS,
  taskListSortOptionLabel,
  type TaskListSortDir,
  type TaskListSortKey,
} from "@/lib/task-list-sort"
import type { TaskListViewMode } from "@/lib/task-list-preferences"

interface TaskListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  viewMode: TaskListViewMode
  onViewModeChange: (mode: TaskListViewMode) => void
  sortKey: TaskListSortKey
  sortDir: TaskListSortDir
  onSortChange: (key: TaskListSortKey, dir: TaskListSortDir) => void
  resultCount?: number
  className?: string
}

export function TaskListToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortKey,
  sortDir,
  onSortChange,
  resultCount,
  className,
}: TaskListToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search by task description…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={cn(
            "w-full rounded-xl border border-border/50 bg-muted/15 py-2.5 pl-10 pr-10 text-sm text-foreground",
            "placeholder:text-muted-foreground/70",
            "focus:border-amber/40 focus:outline-none focus:ring-2 focus:ring-amber/20"
          )}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {typeof resultCount === "number" ? (
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
            {resultCount} shown
          </span>
        ) : null}

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={`${sortKey}:${sortDir}`}
            onChange={(event) => {
              const [key, dir] = event.target.value.split(":") as [TaskListSortKey, TaskListSortDir]
              onSortChange(key, dir)
            }}
            className="h-10 rounded-md border border-border/70 bg-background/60 px-2.5 text-xs text-foreground outline-none focus-visible:border-amber/40 focus-visible:ring-1 focus-visible:ring-amber/30"
            aria-label="Sort tasks"
          >
            {TASK_LIST_SORT_OPTIONS.map(({ key, dir }) => (
              <option key={`${key}:${dir}`} value={`${key}:${dir}`}>
                {taskListSortOptionLabel(key, dir)}
              </option>
            ))}
          </select>
        </label>

        <div
          className="inline-flex rounded-lg border border-border/60 bg-muted/20 p-0.5"
          role="group"
          aria-label="Task list view"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("cards")}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              viewMode === "cards"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === "cards"}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === "list"}
          >
            <List className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>
    </div>
  )
}
