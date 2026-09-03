"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, useCallback, useEffect } from "react"
import {
  ApiErrorCallout,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/shared"
import { TaskListToolbar, TaskListOverview, TaskCard, TaskListView } from "@/components/tasks"
import {
  buildTaskStatusCounts,
  taskMatchesStatusFilter,
  type TaskStatusFilter,
} from "@/lib/task-list-filters"
import { ProductTaskAssignmentFields } from "@/components/tasks/product-task-assignment-fields"
import { useTasks, useDeleteTask, TASK_LIST_PAGE_LIMIT } from "@/hooks"
import type { Task } from "@/types/api"
import { isServerError } from "@/types/api"
import { workspacePageClass } from "@/constants/chat-layout"
import { ROUTES } from "@/lib/routes"
import {
  buildProductTaskAssignment,
  taskMatchesProductFilter,
  useShowProductTaskAssignment,
} from "@/lib/product-task-assignment"
import {
  loadTaskListUiPreferences,
  persistTaskListUiPreferences,
  type TaskListViewMode,
} from "@/lib/task-list-preferences"
import {
  nextTaskListSort,
  sortTasks,
  type TaskListSortDir,
  type TaskListSortKey,
} from "@/lib/task-list-sort"

export default function TasksPage() {
  const showProductAssignment = useShowProductTaskAssignment()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all")
  const [filterProductId, setFilterProductId] = useState("")
  const [filterSdlcPhase, setFilterSdlcPhase] = useState("")
  const [pendingDelete, setPendingDelete] = useState<{ taskId: string; taskName: string } | null>(
    null
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<TaskListViewMode>("cards")
  const [sortKey, setSortKey] = useState<TaskListSortKey>("created")
  const [sortDir, setSortDir] = useState<TaskListSortDir>("desc")
  const { data: tasks, isLoading, error } = useTasks({ limit: TASK_LIST_PAGE_LIMIT })
  const deleteMutation = useDeleteTask()

  useEffect(() => {
    const prefs = loadTaskListUiPreferences()
    setViewMode(prefs.viewMode)
    setSortKey(prefs.sortKey)
    setSortDir(prefs.sortDir)
  }, [])

  const updateViewMode = useCallback((mode: TaskListViewMode) => {
    setViewMode(mode)
    persistTaskListUiPreferences({
      viewMode: mode,
      sortKey,
      sortDir,
    })
  }, [sortDir, sortKey])

  const updateSort = useCallback((key: TaskListSortKey, dir: TaskListSortDir) => {
    setSortKey(key)
    setSortDir(dir)
    persistTaskListUiPreferences({
      viewMode,
      sortKey: key,
      sortDir: dir,
    })
  }, [viewMode])

  const handleSortHeader = useCallback(
    (key: TaskListSortKey) => {
      const next = nextTaskListSort(sortKey, sortDir, key)
      updateSort(next.sortKey, next.sortDir)
    },
    [sortDir, sortKey, updateSort]
  )

  const filterAssignment = showProductAssignment
    ? buildProductTaskAssignment(filterProductId, filterSdlcPhase)
    : null
  const filterIncomplete =
    showProductAssignment &&
    ((filterProductId.trim() && !filterAssignment) ||
      (!filterProductId.trim() && filterSdlcPhase.trim()))

  const handleDelete = useCallback((taskId: string, taskName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteError(null)
    setPendingDelete({ taskId, taskName })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.taskId, {
      onSuccess: () => {
        setPendingDelete(null)
        setDeleteError(null)
      },
      onError: (err) => {
        console.error("Failed to delete task:", err)
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete task. Please try again."
        )
      },
    })
  }, [pendingDelete, deleteMutation])

  const clearProductFilter = () => {
    setFilterProductId("")
    setFilterSdlcPhase("")
  }

  const taskRows = tasks?.tasks ?? []
  const statusCounts = useMemo(() => buildTaskStatusCounts(taskRows), [taskRows])
  const filteredTasks = taskRows.filter((task: Task) => {
    if (!task.task.toLowerCase().includes(search.toLowerCase())) return false
    if (!taskMatchesStatusFilter(task, statusFilter)) return false
    if (!showProductAssignment) return true
    if (filterIncomplete) return true
    return taskMatchesProductFilter(task, filterProductId, filterSdlcPhase)
  })
  const sortedTasks = useMemo(
    () => sortTasks(filteredTasks, sortKey, sortDir),
    [filteredTasks, sortKey, sortDir]
  )
  const totalStored = tasks?.total ?? 0
  const hasProductFilter =
    showProductAssignment && Boolean(filterProductId.trim() || filterSdlcPhase.trim())

  return (
    <div className={workspacePageClass("space-y-6")}>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setDeleteError(null)
          }
        }}
        title={
          pendingDelete
            ? `Delete task "${pendingDelete.taskName}"?`
            : "Delete task?"
        }
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteMutation.isPending}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
      />
      <PageHeader title="Tasks" description="Manage and monitor your pipeline agent tasks" />

      {showProductAssignment ? (
        <Card variant="minimal" interactive={false}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Product assignment</CardTitle>
            <CardDescription>
              Filter tasks by product and SDLC phase. Create new tasks from Chat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <ProductTaskAssignmentFields
              compact
              productId={filterProductId}
              sdlcPhase={filterSdlcPhase}
              onProductIdChange={setFilterProductId}
              onSdlcPhaseChange={setFilterSdlcPhase}
            />
            {filterIncomplete ? (
              <p className="text-sm text-amber/90">
                Choose both a product and SDLC phase to filter, or clear the selection to show all tasks.
              </p>
            ) : null}
            {hasProductFilter && !filterIncomplete ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={clearProductFilter}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Clear filter
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {taskRows.length > 0 ? (
        <TaskListOverview
          counts={statusCounts}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          filteredCount={filteredTasks.length}
        />
      ) : null}

      <TaskListToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={updateViewMode}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={updateSort}
        resultCount={filteredTasks.length}
      />

      {isLoading || (error && isServerError(error)) ? (
        <LoadingState
          message={error && isServerError(error) ? "Taking you to our status page…" : "Loading tasks..."}
        />
      ) : error ? (
        <Card variant="minimal" interactive={false}>
          <CardContent className="py-6">
            <ApiErrorCallout
              error={error}
              title="Failed to load tasks"
              fallbackMessage="Failed to load tasks"
            />
          </CardContent>
        </Card>
      ) : taskRows.length === 0 ? (
        <Card variant="minimal" interactive={false}>
          <CardContent className="py-12">
            <EmptyState title="No tasks found">
              <p className="mb-4 text-sm text-muted-foreground">
                Create tasks from Chat — describe your goal and the agents will handle the rest.
              </p>
              <Link href={ROUTES.chat}>
                <Button className="bg-amber text-amber-foreground hover:bg-amber/90">
                  Open Chat
                </Button>
              </Link>
            </EmptyState>
          </CardContent>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card variant="minimal" interactive={false}>
          <CardContent className="py-10 text-center text-muted-foreground space-y-3">
            <p>
              {search
                ? `No tasks match "${search}"`
                : statusFilter !== "all"
                  ? "No tasks match this status filter."
                  : filterAssignment
                    ? "No tasks match this product and SDLC phase."
                    : "No tasks match your filters."}
            </p>
            {(search || hasProductFilter || statusFilter !== "all") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                  clearProductFilter()
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(totalStored > taskRows.length || (filterAssignment && !filterIncomplete)) && (
            <div className="rounded-lg border border-border/40 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
              {totalStored > taskRows.length ? (
                <p>
                  Showing the newest {taskRows.length} of {totalStored} tasks (up to{" "}
                  {TASK_LIST_PAGE_LIMIT} per load).
                </p>
              ) : null}
              {filterAssignment && !filterIncomplete ? (
                <p className={totalStored > taskRows.length ? "mt-1" : undefined}>
                  Filtered to selected product and SDLC phase — {filteredTasks.length} shown.
                </p>
              ) : null}
            </div>
          )}
          {viewMode === "list" ? (
            <TaskListView
              tasks={sortedTasks}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              showProduct={showProductAssignment}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={handleSortHeader}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedTasks.map((task: Task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
