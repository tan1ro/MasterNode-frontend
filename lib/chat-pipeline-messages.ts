import type { ChatMessage } from "@/types/api"

export function isPipelineCompletionContent(content: string): boolean {
  const trimmed = (content || "").trim()
  return (
    trimmed.startsWith("Pipeline completed.") ||
    trimmed.startsWith("Slides look sharp and clean.") ||
    trimmed.startsWith("Your document is ready.")
  )
}

/** True when a message carries a pipeline deliverable for a task (doc, slides, result, etc.). */
export function messageHasPipelineDeliverable(
  message: Pick<ChatMessage, "role" | "content" | "metadata">
): boolean {
  if (message.role !== "assistant") return false
  if (isPipelineCompletionContent(message.content || "")) return true
  const meta = message.metadata || {}
  if (meta.presentation_artifact) return true
  if (meta.task_result) return true
  if (typeof meta.document_markdown === "string" && meta.document_markdown.trim()) return true
  if (typeof meta.html_writeup === "string" && meta.html_writeup.trim()) return true
  if (meta.html_writeup && typeof meta.html_writeup === "object") return true
  return false
}

export function conversationHasPipelineCompletion(
  messages: Pick<ChatMessage, "role" | "content" | "metadata">[],
  taskId: string
): boolean {
  const tid = taskId.trim()
  if (!tid) return false
  return messages.some((m) => {
    if (String(m.metadata?.task_id || "").trim() !== tid) return false
    return messageHasPipelineDeliverable(m)
  })
}

/** Task ids that already have a deliverable in the thread — plan review should stay closed. */
export function pipelineTasksWithDeliverables(
  messages: Pick<ChatMessage, "role" | "content" | "metadata">[]
): Set<string> {
  const ids = new Set<string>()
  for (const message of messages) {
    const taskId = String(message.metadata?.task_id || "").trim()
    if (!taskId || !messageHasPipelineDeliverable(message)) continue
    ids.add(taskId)
  }
  return ids
}

export function latestPipelineCompletionMessageId(
  messages: Pick<ChatMessage, "message_id" | "role" | "content" | "metadata">[]
): Map<string, string> {
  const byTask = new Map<string, string>()
  for (const message of messages) {
    if (message.role !== "assistant") continue
    const taskId = String(message.metadata?.task_id || "").trim()
    if (!taskId) continue
    if (messageHasPipelineDeliverable(message)) {
      byTask.set(taskId, message.message_id)
    }
  }
  return byTask
}
