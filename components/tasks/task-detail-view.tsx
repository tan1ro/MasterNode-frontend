"use client"

import { useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { TaskResultViewer } from "@/components/tasks/task-result-viewer"
import { normalizeTaskResultForViewer } from "@/lib/pipeline-output"
import { Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import {
  TaskInfoSidebar,
  PartialResultsCard,
  TaskStageProgress,
  TaskMissionControl,
  TaskContextPanel,
} from "@/components/tasks"
import { taskDetailInsetPanel } from "@/components/tasks/task-detail-section"
import { useTask, useDeleteTask } from "@/hooks"
import { getTaskShortLabel } from "@/lib/task-display"
import { workspacePageClass } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

export interface TaskDetailViewProps {
  taskId: string
  backHref: string
  backLabel?: string
  onDeleteSuccess: () => void
  topSlot?: ReactNode
  className?: string
  /** When true, omits the back link row (parent provides navigation). */
  hideTopNav?: boolean
  /** Optional chat thread id from ?chat= when opened from /chat. */
  queryChatId?: string | null
}

export function TaskDetailView({
  taskId,
  backHref,
  backLabel = "Back",
  onDeleteSuccess,
  topSlot,
  className = workspacePageClass(),
  hideTopNav = false,
  queryChatId = null,
}: TaskDetailViewProps) {
  const queryClient = useQueryClient()
  const { data: task, isLoading, error, isFetching } = useTask(taskId)
  const deleteMutation = useDeleteTask()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const invalidateTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    queryClient.invalidateQueries({ queryKey: ["metrics", "task", taskId] })
  }

  const confirmDelete = () => {
    deleteMutation.mutate(taskId, {
      onSuccess: onDeleteSuccess,
      onError: (err) => {
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete task. Please try again."
        )
      },
    })
  }

  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState message="Loading task details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ApiErrorCallout
          error={error}
          title="Failed to load task"
          fallbackMessage="Failed to load task details"
        />
      </div>
    )
  }

  if (!task) {
    return (
      <div className={className}>
        <Callout type="warning" title="Task not found">
          <p>The requested task could not be found.</p>
        </Callout>
      </div>
    )
  }

  const taskTitle = getTaskShortLabel(task.task)
  const fullTask = task.task.trim()
  const displayResult = normalizeTaskResultForViewer(
    task as unknown as Record<string, unknown>
  )
  return (
    <div className={className}>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteError(null)
        }}
        title={`Delete task "${taskTitle}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteMutation.isPending}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
      />
      {topSlot}
      <div className={hideTopNav ? "mb-4 sm:mb-6" : "mb-4 sm:mb-6 mt-4"}>
        {!hideTopNav ? (
          <div className="flex items-center gap-4 mb-4">
            <Link href={backHref}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-wide mb-2">
              Task Details
            </h1>
            <p className="text-base sm:text-lg font-medium text-foreground">{taskTitle}</p>
            {fullTask !== taskTitle || fullTask.includes("\n") ? (
              <div className={cn("mt-3", taskDetailInsetPanel, "p-3")}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                  Full task
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {fullTask || "—"}
                </p>
              </div>
            ) : null}
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setDeleteError(null)
              setDeleteDialogOpen(true)
            }}
            disabled={deleteMutation.isPending}
            title="Delete task"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <TaskContextPanel task={task} queryChatId={queryChatId} />
        <TaskInfoSidebar task={task} />
        <TaskMissionControl
          task={task}
          templateIds={task.template_ids}
          onPipelineEvent={invalidateTaskQueries}
          isTaskFetching={isFetching}
          className="mb-6"
        />
        <div className="mt-6">
          <TaskStageProgress taskId={task.task_id} task={task} />
        </div>
        {(() => {
          const wc = task.validation?.webapp_coherence as
            | { applicable?: boolean; issues?: string[]; warnings?: string[]; score?: number }
            | undefined
          if (wc?.applicable && (wc.issues?.length || wc.warnings?.length)) {
            return (
              <div className="mt-6">
                <Callout type={wc.issues?.length ? "warning" : "info"} title="Generated webapp checks">
                  <p className="text-sm mb-2">
                    Static coherence score: <strong>{wc.score ?? "—"}</strong>
                  </p>
                  {wc.issues && wc.issues.length > 0 && (
                    <ul className="text-sm list-disc pl-5 space-y-1 mb-2">
                      {wc.issues.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {wc.warnings && wc.warnings.length > 0 && (
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      {wc.warnings.map((line, i) => (
                        <li key={`w-${i}`}>{line}</li>
                      ))}
                    </ul>
                  )}
                </Callout>
              </div>
            )
          }
          return null
        })()}
        {displayResult !== null && displayResult !== undefined && (
          <div className="mt-6">
            <TaskResultViewer
              result={displayResult}
              taskDescription={task.task}
              taskId={task.task_id}
            />
          </div>
        )}
        {task.partial_results && Object.keys(task.partial_results).length > 0 && (
          <PartialResultsCard results={task.partial_results} />
        )}
      </div>
    </div>
  )
}
