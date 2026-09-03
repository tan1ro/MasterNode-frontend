const STATUS_CHECK_PATTERNS: RegExp[] = [
  /^\s*(is it done|is this done|done\??|status\??|any update\??|updates\??)\s*$/i,
  /^\s*(what happened|what's happening|whats happening|continue|go on|explain)\s*\??\s*$/i,
]

const EXECUTION_VERB_RE =
  /\b(build|create|generate|implement|develop|design|code|write|refactor|fix|debug|analy[sz]e|review|draft|plan|optimi[sz]e|produce|make)\b/i

const DELIVERABLE_RE =
  /\b(fullstack|frontend|backend|api|html|css|javascript|js|react|page|app|component|project|script|calculator|dashboard|crud|sprint|backlog|release|pipeline|contract|nda|compliance|market\s+research|competitive|tam|legal|policy|privacy|terms)\b/i

const TASK_TRIGGER_RE =
  /\b(run|start|execute|launch)\s+(the\s+)?(pipeline|task|agent)\b/i

export type ChatIntent = "pipeline" | "conversation"

export interface ChatIntentContext {
  hasPendingAttachments?: boolean
  pipelineRunning?: boolean
}

const RESEARCH_INFO_RE =
  /\b(know about|tell me about|learn about|what is|what are|status of|overview of|state of|update on|news about|research)\b/i

export function isPipelineStatusFollowUp(text: string): boolean {
  const msg = text.trim()
  if (!msg) return false
  return STATUS_CHECK_PATTERNS.some((re) => re.test(msg))
}

/**
 * When the user has explicitly enabled pipeline mode, every send should start a
 * pipeline — except short status/follow-up phrases that belong in chat.
 */
export function shouldUseExplicitPipelineMode(text: string): boolean {
  return !isPipelineStatusFollowUp(text)
}

export function routeMessageIntent(text: string, context: ChatIntentContext = {}): ChatIntent {
  const msg = text.trim()
  if (!msg) return "conversation"

  if (isPipelineStatusFollowUp(msg)) {
    return "conversation"
  }

  const isQuestion = /\?\s*$/.test(msg) || /^(is|are|what|why|how|when|where|who|can|could|should|would|i want to know)\b/i.test(msg)
  if (isQuestion && msg.length <= 120 && !TASK_TRIGGER_RE.test(msg)) {
    return "conversation"
  }

  if (TASK_TRIGGER_RE.test(msg)) {
    return "pipeline"
  }

  const asksForExecution = EXECUTION_VERB_RE.test(msg) && DELIVERABLE_RE.test(msg)
  if (asksForExecution) {
    return "pipeline"
  }

  if (RESEARCH_INFO_RE.test(msg) && !asksForExecution && !TASK_TRIGGER_RE.test(msg)) {
    return "conversation"
  }

  if (context.hasPendingAttachments && /\b(analy[sz]e|process|summari[sz]e|extract|use these|with these)\b/i.test(msg)) {
    return "pipeline"
  }

  if (context.pipelineRunning && msg.length <= 120 && !asksForExecution) {
    return "conversation"
  }

  return "conversation"
}
