import type { AssistantIntakeField } from "@/lib/assistant-intake"

/** Values that look filled but carry no real information for the assistant. */
const NON_SUBSTANTIVE_VALUE_PATTERNS: RegExp[] = [
  /^i\s+want(?:\s+for)?(?:\s+my)?(?:\s+project)?(?:\s+here)?[.!?]*$/i,
  /^i\s+want\s+for\s+my\s+project(?:\s+here)?[.!?]*$/i,
  /^for\s+my\s+project(?:\s+here)?[.!?]*$/i,
  /^my\s+project(?:\s+here)?[.!?]*$/i,
  /^(?:here|this|that|yes|no|ok|okay|sure|please|help|generate|go\s+ahead)[.!?]*$/i,
  /^tell\s+me[.!?]*$/i,
  /^tell\s+me\s+about\b/i,
  /^do\s+it[.!?]*$/i,
  /^n[.!?]*$/i,
  /^want\s+it\s+(?:rfi|rfp)[.!?]*$/i,
  /^i\s+want\s+it\s+(?:rfi|rfp)[.!?]*$/i,
]

const VAGUE_INTENT_RE =
  /^i\s+want\b/i

const VAGUE_USER_PROMPT_PATTERNS: RegExp[] = [
  /^i\s+want\b/i,
  /^want\s+it\s+(?:rfi|rfp)\b/i,
  /^want\s+(?:an?\s+)?(?:rfi|rfp)\b/i,
  /^(?:rfi|rfp)\s*(?:please|response|help)?[.!?]*$/i,
  /^for\s+my\s+project\b/i,
  /^my\s+project\b/i,
  /^(?:help|please|tell)\s+me\b/i,
  /^tell\s+me\s+about\b/i,
  /\bbased\s+on\s+(?:the\s+)?(?:write[\s-]?up|document|file|attachment)\b/i,
  /^(?:this|that|here)[.!?]*$/i,
]

/** True when the user's composer message is intent-only — must not become field values or skip intake. */
export function isVagueUserPrompt(message: string): boolean {
  const text = message.trim()
  if (!text) return true
  if (/^tell\s+me\s+about\b/i.test(text)) return true
  if (/\bbased\s+on\s+(?:the\s+)?(?:write[\s-]?up|document|file|attachment)\b/i.test(text) && text.length < 100) {
    return true
  }
  if (VAGUE_USER_PROMPT_PATTERNS.some((pattern) => pattern.test(text))) {
    return text.length < 80
  }
  if (VAGUE_INTENT_RE.test(text) && text.length < 64 && !/\d/.test(text)) return true
  if (/^(?:rfi|rfp)\b/i.test(text) && text.length < 48) return true
  return false
}

/**
 * True when a captured intake value is specific enough to skip re-asking or auto-send.
 * File fields are handled separately; optional fields may stay permissive via caller.
 */
export function isSubstantiveIntakeValue(
  value: string,
  field?: Pick<AssistantIntakeField, "name" | "kind">
): boolean {
  const text = value.trim()
  if (!text) return false
  if (field?.kind === "file") return true
  if (/^\d+(?:[.:]\d+)?$/.test(text)) return true
  if (text.length <= 2) return false
  if (NON_SUBSTANTIVE_VALUE_PATTERNS.some((pattern) => pattern.test(text))) return false
  if (VAGUE_INTENT_RE.test(text) && text.length < 56 && !/\d/.test(text)) return false
  if (/^(create|plan|build|generate|make|run|draft|respond|help)\b/i.test(text) && text.length < 40) {
    return false
  }
  return true
}

/** Drop weak regex captures so intake still asks clarifying questions. */
export function filterSubstantiveIntakeValues(
  values: Record<string, string>,
  fields: AssistantIntakeField[]
): Record<string, string> {
  const fieldByName = new Map(fields.map((field) => [field.name, field]))
  const out: Record<string, string> = {}
  for (const [name, raw] of Object.entries(values)) {
    const field = fieldByName.get(name)
    if (isSubstantiveIntakeValue(raw, field)) out[name] = raw.trim()
  }
  return out
}
