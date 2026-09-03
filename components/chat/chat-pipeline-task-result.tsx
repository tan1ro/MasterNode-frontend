"use client"

import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useTask } from "@/hooks"
import { TaskResultViewer } from "@/components/tasks/task-result-viewer"
import { normalizeTaskResultForViewer } from "@/lib/pipeline-output"

interface ChatPipelineTaskResultProps {
  taskId: string
  /** Cached metadata from the completion message when the task API is unavailable. */
  fallbackResult?: unknown
}

export function ChatPipelineTaskResult({ taskId, fallbackResult }: ChatPipelineTaskResultProps) {
  const { data: task, isLoading } = useTask(taskId, Boolean(taskId))

  const displayResult = useMemo(() => {
    if (task) {
      const status = String(task.status || "").toLowerCase()
      if (status === "completed") {
        return normalizeTaskResultForViewer(task as unknown as Record<string, unknown>)
      }
    }
    if (fallbackResult !== null && fallbackResult !== undefined) {
      if (
        typeof fallbackResult === "object" &&
        !Array.isArray(fallbackResult) &&
        ("final_result" in fallbackResult || "partial_results" in fallbackResult || "task_id" in fallbackResult)
      ) {
        return normalizeTaskResultForViewer(fallbackResult as Record<string, unknown>)
      }
      return fallbackResult
    }
    return null
  }, [task, fallbackResult])

  if (isLoading && !displayResult) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        Loading pipeline output…
      </div>
    )
  }

  if (!displayResult) return null

  return (
    <TaskResultViewer result={displayResult} taskId={taskId} variant="inline" />
  )
}
