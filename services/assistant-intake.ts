import { apiClient } from "@/lib/api-client"
import { intakeFieldQuestion, type AssistantIntakeField } from "@/lib/assistant-intake"
import { isSubstantiveIntakeValue } from "@/lib/assistant-intake-quality"

export interface AssistantIntakeExtractRequest {
  template_id: string
  field_names: string[]
  pending_message?: string
  context_messages?: string[]
  use_memory?: boolean
  memory_sources?: string[]
}

export interface AssistantIntakeExtractResponse {
  template_id: string
  values: Record<string, string>
  hints?: string[]
  value_sources?: Record<string, "memory" | "message">
  memory_checked?: boolean
  memory_sources?: string[]
}

export interface AssistantIntakeClarifyOption {
  id: string
  label: string
}

export interface AssistantIntakeClarifyQuestion {
  id: string
  field: string
  prompt: string
  /** Why this question is being asked given the user's message. */
  reason?: string
  options: AssistantIntakeClarifyOption[]
}

export interface AssistantIntakeClarifyRequest extends AssistantIntakeExtractRequest {
  template_name?: string
  template_description?: string
  field_labels?: Record<string, string>
  known_values?: Record<string, string>
  model_id?: string
}

export interface AssistantIntakeClarifyResponse extends AssistantIntakeExtractResponse {
  /** Short explanation of what is unclear and what will be asked. */
  thinking?: string
  questions: AssistantIntakeClarifyQuestion[]
}

const DEFAULT_OPTIONS: AssistantIntakeClarifyOption[] = [
  { id: "a", label: "Use details from my message / attached files" },
  { id: "b", label: "I'll type the exact name or value" },
  { id: "c", label: "Keep this broad / general" },
]

function extractSubjectFromMessage(message: string): string {
  const text = message.replace(/\s+/g, " ").trim()
  if (!text) return ""
  const lowered = text.toLowerCase()
  const prefixes = [
    "i want to know about ",
    "i want to know ",
    "tell me about ",
    "explain ",
    "what is ",
    "what's ",
    "whats ",
    "research ",
    "write about ",
    "analyze ",
    "analyse ",
  ]
  for (const prefix of prefixes) {
    if (lowered.startsWith(prefix)) {
      return text.slice(prefix.length).replace(/^[?.!,\s]+|[?.!,\s]+$/g, "").slice(0, 120)
    }
  }
  return ""
}

function dynamicFallbackOptions(
  fieldName: string,
  subject: string,
  pendingMessage: string
): AssistantIntakeClarifyOption[] {
  const subj = subject || "this topic"
  if (["topic", "product", "our_product", "market", "prospect"].includes(fieldName)) {
    return [
      { id: "a", label: `Focus on ${subj}` },
      { id: "b", label: `${subj} vs closest alternatives` },
      { id: "c", label: "I'll type a different focus" },
    ]
  }
  if (fieldName === "geo") {
    return [
      { id: "a", label: "Global / not geography-specific" },
      { id: "b", label: "United States" },
      { id: "c", label: "India / South Asia" },
      { id: "d", label: "I'll type the region" },
    ]
  }
  if (fieldName === "goal") {
    return [
      { id: "a", label: `Overview of what ${subj} is` },
      { id: "b", label: `How ${subj} works in practice` },
      { id: "c", label: `How to engage with / apply to ${subj}` },
      { id: "d", label: "I'll describe the outcome I want" },
    ]
  }
  if (subject) {
    return [
      { id: "a", label: `Use “${subj}” from my request` },
      { id: "b", label: "I'll type the exact value" },
      { id: "c", label: `Keep ${subj} as the main focus` },
    ]
  }
  const snippet =
    pendingMessage.trim().length > 48
      ? `${pendingMessage.trim().slice(0, 48)}…`
      : pendingMessage.trim()
  return snippet
    ? [
        { id: "a", label: `Use what’s in my request (“${snippet}”)` },
        { id: "b", label: "I'll type the exact value" },
        { id: "c", label: "Keep this broad / general" },
      ]
    : DEFAULT_OPTIONS.map((opt) => ({ ...opt }))
}

/** Pipeline-style MCQs for unanswered fields when the LLM clarify API is unavailable. */
export function buildFallbackClarifyQuestions(
  fields: AssistantIntakeField[],
  knownValues: Record<string, string> = {},
  limit = 3,
  pendingMessage = ""
): AssistantIntakeClarifyQuestion[] {
  const subject = extractSubjectFromMessage(pendingMessage)
  const unanswered = fields.filter((field) => {
    if (field.kind === "file") return false
    return !isSubstantiveIntakeValue(knownValues[field.name] ?? "", field)
  })
  return unanswered.slice(0, limit).map((field, index) => {
    let prompt = intakeFieldQuestion(field)
    if (subject && field.name === "goal") {
      prompt = `For “${subject}”, what outcome do you want?`
    } else if (subject && field.name === "market") {
      prompt = `Should this analysis center on ${subject}, or a broader market?`
    } else if (subject && (field.name === "topic" || field.name === "product")) {
      prompt = `Confirm the focus — is it ${subject}?`
    }
    return {
      id: `q${index + 1}`,
      field: field.name,
      prompt,
      reason: subject
        ? `Grounding “${field.label}” in your request about ${subject}.`
        : `Need a clear value for ${field.label} before generating — vague placeholders like “it” aren’t enough.`,
      options: dynamicFallbackOptions(field.name, subject, pendingMessage),
    }
  })
}

export async function fetchAssistantIntakeExtract(
  body: AssistantIntakeExtractRequest
): Promise<AssistantIntakeExtractResponse> {
  const { data } = await apiClient.post<AssistantIntakeExtractResponse>(
    "/v1/assistants/intake/extract",
    body
  )
  return data
}

/**
 * Extract known values + pipeline-style MCQs for remaining intake gaps.
 * Falls back to extract + local MCQs when clarify is missing (older API) or fails.
 */
export async function fetchAssistantIntakeClarify(
  body: AssistantIntakeClarifyRequest,
  fieldsForFallback: AssistantIntakeField[] = []
): Promise<AssistantIntakeClarifyResponse> {
  try {
    const { data } = await apiClient.post<AssistantIntakeClarifyResponse>(
      "/v1/assistants/intake/clarify",
      body
    )
    const values = data.values ?? {}
    const questions = Array.isArray(data.questions)
      ? data.questions.map((q) => ({
          ...q,
          reason: typeof q.reason === "string" ? q.reason.trim() || undefined : undefined,
        }))
      : []
    const thinking =
      typeof data.thinking === "string" ? data.thinking.trim() : undefined
    if (questions.length > 0) {
      return { ...data, values, questions, thinking }
    }
    return {
      ...data,
      values,
      thinking:
        thinking ||
        "Looking at your request to see which details are still missing before generating.",
      questions: buildFallbackClarifyQuestions(fieldsForFallback, {
        ...(body.known_values ?? {}),
        ...values,
      }, 3, body.pending_message ?? ""),
    }
  } catch {
    // Older backends only expose /extract — still read context, then ask locally.
    try {
      const extracted = await fetchAssistantIntakeExtract({
        template_id: body.template_id,
        field_names: body.field_names,
        pending_message: body.pending_message,
        context_messages: body.context_messages,
        use_memory: body.use_memory,
        memory_sources: body.memory_sources,
      })
      const values = {
        ...(body.known_values ?? {}),
        ...(extracted.values ?? {}),
      }
      return {
        ...extracted,
        values,
        questions: buildFallbackClarifyQuestions(
          fieldsForFallback,
          values,
          3,
          body.pending_message ?? ""
        ),
      }
    } catch {
      const values = { ...(body.known_values ?? {}) }
      return {
        template_id: body.template_id,
        values,
        questions: buildFallbackClarifyQuestions(
          fieldsForFallback,
          values,
          3,
          body.pending_message ?? ""
        ),
      }
    }
  }
}

/** Merge backend suggestions without overwriting user edits or existing values. */
export function mergeIntakeSuggestions(
  current: Record<string, string>,
  suggested: Record<string, string>
): Record<string, string> {
  const out = { ...current }
  for (const [key, value] of Object.entries(suggested)) {
    const next = (value ?? "").trim()
    if (!next || (out[key] ?? "").trim()) continue
    out[key] = next
  }
  return out
}

/** Apply MCQ answer labels onto intake field values. */
export function applyClarifyAnswersToValues(
  questions: AssistantIntakeClarifyQuestion[],
  answers: Record<string, string>,
  current: Record<string, string>
): Record<string, string> {
  const out = { ...current }
  for (const question of questions) {
    const chosen = (answers[question.id] || "").trim()
    if (!chosen || !question.field) continue
    let label = chosen
    if (chosen.startsWith("other:")) {
      label = chosen.slice(6).trim()
    } else if (chosen === "other") {
      continue
    } else {
      const match = question.options.find((opt) => opt.id === chosen)
      label = match?.label?.trim() || chosen
    }
    if (label) out[question.field] = label
  }
  return out
}
