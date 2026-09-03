import { classifyPipelineOutput, pipelineOutputKindLabel } from "@/lib/pipeline-output"
import type { ChatMessage } from "@/types/api"

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function proseFromResult(result: unknown): string | null {
  if (result == null) return null
  if (typeof result === "string") return pickString(result)
  if (typeof result !== "object" || Array.isArray(result)) return null
  const root = result as Record<string, unknown>
  for (const key of ["summary", "report", "answer", "output", "result", "text"] as const) {
    const direct = pickString(root[key])
    if (direct) return direct
  }
  const nested = root.final_result
  if (typeof nested === "string") return pickString(nested)
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>
    for (const key of ["summary", "report", "answer", "output", "result", "text"] as const) {
      const value = pickString(inner[key])
      if (value) return value
    }
  }
  return null
}

export interface TaskSummaryReport {
  title: string
  summary: string
  details: string[]
}

export function buildTaskSummaryReport(
  result: unknown,
  taskDescription?: string
): TaskSummaryReport | null {
  const prose = proseFromResult(result)
  const kind = result ? classifyPipelineOutput(result) : "text"
  const kindLabel = pipelineOutputKindLabel(kind)

  const root = result && typeof result === "object" && !Array.isArray(result)
    ? (result as Record<string, unknown>)
    : {}
  const nested =
    root.final_result && typeof root.final_result === "object" && !Array.isArray(root.final_result)
      ? (root.final_result as Record<string, unknown>)
      : root

  const details: string[] = []
  const entrypoint = pickString(root.entrypoint) || pickString(nested.entrypoint)
  if (entrypoint) details.push(`Entrypoint: ${entrypoint}`)

  const confidenceValue =
    typeof root.confidence === "number"
      ? root.confidence
      : typeof nested.confidence === "number"
        ? nested.confidence
        : null
  if (confidenceValue !== null) {
    details.push(`Confidence: ${Math.round(confidenceValue * 100)}%`)
  }

  const defaultSummary =
    kind === "code"
      ? "Code artifacts were generated and validated by the pipeline."
      : kind === "qna"
        ? "The pipeline produced a direct answer to your request."
        : kind === "presentation"
          ? "Presentation content is ready to review or export."
          : kind === "document"
            ? "A document-style report is ready to review."
            : "The pipeline run completed with a validated output."

  const summary = prose || defaultSummary
  const title = taskDescription?.trim() || `${kindLabel} result`

  if (!summary && details.length === 0 && !taskDescription?.trim()) {
    return null
  }

  return {
    title,
    summary,
    details,
  }
}

export interface ChatTaskInsights {
  conversationTitle?: string
  userPrompt?: string
  assistantNotes: string[]
}

export function buildChatTaskInsights(
  messages: ChatMessage[],
  taskId: string
): ChatTaskInsights | null {
  const tid = taskId.trim()
  if (!tid || messages.length === 0) return null

  const related = messages.filter((msg) => {
    const metaTask = msg.metadata?.task_id
    return typeof metaTask === "string" && metaTask.trim() === tid
  })

  const firstRelatedIdx = messages.findIndex((msg) => {
    const metaTask = msg.metadata?.task_id
    return typeof metaTask === "string" && metaTask.trim() === tid
  })

  let userPrompt: string | undefined
  if (firstRelatedIdx > 0) {
    for (let i = firstRelatedIdx - 1; i >= 0; i -= 1) {
      const msg = messages[i]
      if (msg.role === "user" && msg.content.trim()) {
        userPrompt = msg.content.trim()
        break
      }
    }
  }

  const assistantNotes = related
    .filter((msg) => msg.role === "assistant" && msg.content.trim())
    .map((msg) => msg.content.trim())
    .slice(-3)

  if (!userPrompt && assistantNotes.length === 0) {
    return null
  }

  return {
    userPrompt,
    assistantNotes,
  }
}
