import type { ChatMessage } from "@/types/api"
import type { PipelinePlanPayload } from "@/lib/pipeline-plan"

export type PipelineLifecycleStage = "plan_review" | "activated"

export const PIPELINE_LIFECYCLE_PLAN_CONTENT =
  "Review the **Proposed Plan** in the pipeline panel below — answer clarification questions, then click **Run pipeline**. No deliverable is generated until the pipeline finishes."

export const PIPELINE_LIFECYCLE_ACTIVATED_CONTENT =
  "**Pipeline mode activated.** Requirements locked. Stages are running in the pipeline panel below before your deliverable is generated."

export function isPipelineLifecycleMessage(msg: ChatMessage): boolean {
  return Boolean(msg.metadata?.pipeline_lifecycle)
}

/** Older multi-bubble pipeline status messages (before lifecycle merge). */
export function isLegacyPipelineStatusMessage(msg: ChatMessage): boolean {
  if (msg.role !== "assistant") return false
  if (isPipelineLifecycleMessage(msg)) return true
  const meta = msg.metadata || {}
  if (meta.pipeline_stage === "request_analysis") return true
  if (meta.pipeline_plan_review === true) return true
  if (meta.pipeline_activated === true) return true
  const content = (msg.content || "").trim()
  if (content.startsWith("Analyzing your request. The Master agent")) return true
  if (content.includes("Here's your **Proposed Plan**")) return true
  if (content.includes("PIPELINE MODE ACTIVATED")) return true
  return false
}

export function latestPipelineLifecycleMessageIdByTask(
  messages: ChatMessage[]
): Map<string, string> {
  const map = new Map<string, string>()
  for (const msg of messages) {
    if (!isPipelineLifecycleMessage(msg)) continue
    const taskId = String(msg.metadata?.task_id || "").trim()
    if (!taskId) continue
    map.set(taskId, msg.message_id)
  }
  return map
}

/** Hide duplicate pipeline status bubbles — panel holds the live UI. */
export function shouldHidePipelineStatusMessage(
  msg: ChatMessage,
  messages: ChatMessage[]
): boolean {
  if (msg.role !== "assistant") return false
  if (!isLegacyPipelineStatusMessage(msg)) return false

  const taskId = String(msg.metadata?.task_id || "").trim()
  if (!taskId) return false

  const lifecycleLatest = latestPipelineLifecycleMessageIdByTask(messages).get(taskId)
  if (lifecycleLatest && msg.message_id !== lifecycleLatest) {
    return true
  }

  if (isPipelineLifecycleMessage(msg)) return false

  const peers = messages.filter(
    (m) =>
      m.role === "assistant" &&
      String(m.metadata?.task_id || "").trim() === taskId &&
      isLegacyPipelineStatusMessage(m)
  )
  if (peers.length <= 1) return false
  return peers[peers.length - 1]?.message_id !== msg.message_id
}

export function buildPipelineLifecycleMetadata(
  taskId: string,
  stage: PipelineLifecycleStage,
  plan?: PipelinePlanPayload | null
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    task_id: taskId,
    pipeline_lifecycle: true,
    hide_task_link: true,
    hide_message_actions: true,
    pipeline_stage: stage === "plan_review" ? "plan_review" : "execution",
  }
  if (stage === "plan_review" && plan) {
    return {
      ...base,
      pipeline_plan: plan,
      pipeline_plan_review: true,
    }
  }
  if (stage === "activated") {
    return {
      ...base,
      pipeline_activated: true,
      pipeline_plan_review: false,
    }
  }
  return base
}

export function pipelineLifecycleContent(stage: PipelineLifecycleStage): string {
  return stage === "activated"
    ? PIPELINE_LIFECYCLE_ACTIVATED_CONTENT
    : PIPELINE_LIFECYCLE_PLAN_CONTENT
}
