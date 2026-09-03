"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { CreatorTaskDeliverablesPanel } from "@/components/tasks/creator/creator-task-deliverables"
import { CreatorTaskLlmContribution } from "@/components/tasks/creator/creator-task-llm-contribution"
import { CreatorTaskLlmUsage } from "@/components/tasks/creator/creator-task-llm-usage"
import { CreatorTaskSection } from "@/components/tasks/creator/creator-task-section"
import { ChatPipelinePlanCard, ChatPipelinePlanCollapsible } from "@/components/chat/chat-pipeline-plan-card"
import { useDeleteTask, useTask } from "@/hooks"
import { useConversations } from "@/hooks/use-conversations"
import { useTaskLiveExecution } from "@/hooks/use-task-live-execution"
import { workspacePageClass } from "@/constants/chat-layout"
import {
  getCreatorTaskRunPhase,
  getCreatorTaskStatusCopy,
  resolveCreatorTaskDeliverables,
} from "@/lib/creator-task-experience"
import { extractPipelinePlanFromTask } from "@/lib/pipeline-plan"
import { formatUserDateTime } from "@/lib/datetime-local"
import { getTaskShortLabel } from "@/lib/task-display"
import { resolveTaskConversationId } from "@/lib/task-chat-link"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import "./creator-tasks.css"

export interface CreatorTaskDetailViewProps {
  taskId: string
  backHref: string
  backLabel?: string
  onDeleteSuccess: () => void
  topSlot?: ReactNode
  className?: string
  queryChatId?: string | null
}

export function CreatorTaskDetailView({
  taskId,
  backHref,
  backLabel = "All tasks",
  onDeleteSuccess,
  topSlot,
  className = workspacePageClass(),
  queryChatId = null,
}: CreatorTaskDetailViewProps) {
  const queryClient = useQueryClient()
  const { data: task, isLoading, error, isFetching } = useTask(taskId)
  const deleteMutation = useDeleteTask()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const runPhase = task ? getCreatorTaskRunPhase(task.status) : "active"
  const statusCopy = task ? getCreatorTaskStatusCopy(task.status) : null
  const conversationId = task ? resolveTaskConversationId(task, task.task_id, queryChatId) : null

  const { conversations } = useConversations()
  const sourceConversation = useMemo(
    () =>
      conversationId
        ? conversations.find((c) => c.conversation_id === conversationId) ?? null
        : null,
    [conversations, conversationId]
  )

  const { progressDone, progressTotal, elapsed, isActive, graphMetrics } = useTaskLiveExecution({
    task,
    enabled: Boolean(task) && runPhase === "active",
    isTaskFetching: isFetching,
  })

  const deliverables = useMemo(
    () => (task ? resolveCreatorTaskDeliverables(task) : null),
    [task]
  )
  const pipelinePlan = useMemo(
    () => (task ? extractPipelinePlanFromTask(task) : null),
    [task]
  )

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
      <div className={cn("creator-task-page", className)}>
        <LoadingState message="Loading your task…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("creator-task-page", className)}>
        <ApiErrorCallout
          error={error}
          title="Could not load this task"
          fallbackMessage="Something went wrong while loading your task."
        />
      </div>
    )
  }

  if (!task || !statusCopy || !deliverables) {
    return (
      <div className={cn("creator-task-page", className)}>
        <Callout type="warning" title="Task not found">
          <p>We could not find this task. It may have been deleted.</p>
        </Callout>
      </div>
    )
  }

  const taskTitle = getTaskShortLabel(task.task)
  const fullTask = task.task.trim()
  const pct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0
  const currentStep = graphMetrics?.currentStageLabel
  const showProgressCard = runPhase === "active" || runPhase === "review" || runPhase === "failed"

  return (
    <div className={cn("creator-task-page mx-auto space-y-5 sm:space-y-6", className)}>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteError(null)
        }}
        title={`Delete "${taskTitle}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteMutation.isPending}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
      />

      {topSlot}

      <nav className="creator-task-nav" aria-label="Task navigation">
        <div className="creator-task-nav-links">
          <Link href={backHref} className="creator-task-nav-link">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {backLabel}
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-destructive"
          onClick={() => {
            setDeleteError(null)
            setDeleteDialogOpen(true)
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {deleteMutation.isPending ? "Deleting…" : "Delete"}
        </Button>
      </nav>

      <header className="creator-task-hero space-y-3">
        <span className="creator-task-type-pill">
          <Sparkles className="h-3.5 w-3.5 text-[#B0F900]" aria-hidden />
          {deliverables.outputKindLabel}
        </span>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground sm:text-[1.75rem]">
          {taskTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <TaskStatusBadge status={task.status} />
          <span>Started {formatUserDateTime(task.created_at)}</span>
        </div>
        {runPhase === "completed" ? (
          <p className="text-sm text-muted-foreground">{statusCopy.description}</p>
        ) : null}
      </header>

      {conversationId ? (
        <Link
          href={ROUTES.chatConversation(conversationId)}
          className="creator-task-chat-return"
        >
          <span className="creator-task-chat-return-icon" aria-hidden>
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className="creator-task-chat-return-body">
            <span className="creator-task-chat-return-label">Back to chat</span>
            <span className="creator-task-chat-return-name">
              {sourceConversation?.title?.trim() || "Untitled chat"}
            </span>
            {sourceConversation?.created_at ? (
              <span className="creator-task-chat-return-meta">
                Created {formatUserDateTime(sourceConversation.created_at)}
              </span>
            ) : null}
          </span>
          <ArrowRight className="creator-task-chat-return-arrow h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {showProgressCard ? (
        <section
          className={cn(
            "creator-task-run-card space-y-3",
            runPhase === "active" && "creator-task-run-card--active",
            runPhase === "failed" && "creator-task-run-card--failed"
          )}
        >
          <div className="flex items-start gap-2.5">
            {runPhase === "active" ? (
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber" aria-hidden />
            ) : runPhase === "failed" ? null : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
            )}
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-foreground">{statusCopy.label}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{statusCopy.description}</p>
            </div>
          </div>

          {runPhase === "active" ? (
            <div className="space-y-2 pl-6 sm:pl-7">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {progressTotal > 0 ? (
                  <span>
                    Step {progressDone} of {progressTotal}
                  </span>
                ) : null}
                {elapsed ? (
                  <>
                    {progressTotal > 0 ? <span aria-hidden>·</span> : null}
                    <span className="tabular-nums">{elapsed}</span>
                  </>
                ) : null}
                {currentStep ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-foreground">{currentStep}</span>
                  </>
                ) : null}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background/80">
                <div
                  className="h-full rounded-full bg-amber transition-all duration-500"
                  style={{ width: `${Math.max(pct, isActive ? 10 : pct)}%` }}
                />
              </div>
            </div>
          ) : null}

          {runPhase === "review" && task.status === "awaiting_plan_review" && pipelinePlan ? null : runPhase === "review" && conversationId ? (
            <div className="pl-6 sm:pl-7">
              <Link href={ROUTES.chatConversation(conversationId)}>
                <Button size="sm" className="bg-amber text-amber-foreground hover:bg-amber/90">
                  Continue in chat
                </Button>
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {task.status === "awaiting_plan_review" && pipelinePlan ? (
        <CreatorTaskSection
          title="Proposed plan"
          description="This plan is saved on this task. Adjust the format if needed, then continue when you are ready."
          icon={Package}
        >
          <ChatPipelinePlanCard
            taskId={task.task_id}
            plan={pipelinePlan}
            reviewMode
            runPhase="review"
            onContinued={() => {
              void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
              void queryClient.invalidateQueries({ queryKey: ["tasks"] })
            }}
            onContinueFailed={() => {
              void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
              void queryClient.invalidateQueries({ queryKey: ["tasks"] })
            }}
          />
        </CreatorTaskSection>
      ) : pipelinePlan ? (
        <CreatorTaskSection
          title="Saved plan"
          description="Auto-saved on this task when the pipeline proposed it."
          icon={Package}
        >
          <ChatPipelinePlanCollapsible plan={pipelinePlan} taskId={task.task_id} />
        </CreatorTaskSection>
      ) : null}

      <div className="creator-task-body">
        <div className="creator-task-main space-y-5 sm:space-y-6">
          {fullTask ? (
            <CreatorTaskSection
              title="What you asked for"
              description="The request behind this run."
              icon={FileText}
            >
              <p className="creator-task-prompt-text">{fullTask}</p>
            </CreatorTaskSection>
          ) : null}

          {task.error ? (
            <Callout type="error" title="Something went wrong">
              <p className="text-sm whitespace-pre-wrap">{task.error}</p>
            </Callout>
          ) : null}

          <CreatorTaskSection
            title="Your result"
            description={
              runPhase === "completed"
                ? "Here is what we created for you."
                : "Your finished output will appear here."
            }
            icon={Package}
            contentClassName="creator-task-deliverable-shell"
          >
            <CreatorTaskDeliverablesPanel
              taskId={task.task_id}
              taskDescription={task.task}
              deliverables={deliverables}
              isRunActive={runPhase === "active"}
            />
          </CreatorTaskSection>
        </div>

        <aside className="creator-task-aside space-y-4">
          <CreatorTaskLlmUsage task={task} />
          <CreatorTaskLlmContribution task={task} />
        </aside>
      </div>
    </div>
  )
}
