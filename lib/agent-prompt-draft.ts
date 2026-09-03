export interface AgentPromptDraftInput {
  name?: string
  description?: string
}

/** Slug for template ids — lowercase letters, numbers, dashes, underscores. */
export function slugifyTemplateId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64)
}

function rolePhrase(name?: string): string {
  const trimmed = name?.trim()
  if (!trimmed) return "a specialist assistant"
  if (/^(a|an)\s/i.test(trimmed)) return trimmed
  return `a ${trimmed} assistant`
}

function includesLegalTopic(text: string): boolean {
  return /\b(legal|law|contract|compliance|regulation|policy|gdpr|privacy|nda|msa|sla|lawsuit|litigation|ip|trademark|copyright)\b/i.test(
    text
  )
}

function inputBlock(description: string): string[] {
  const d = description.toLowerCase()
  if (/\b(code|snippet|repo|programming|pull request|pr)\b/.test(d)) {
    return ["Language/stack if known: {context}", "Code:", "{code}"]
  }
  if (/\b(contracts?|agreements?|nda|msa|polic(?:y|ies)|documents?)\b/.test(d)) {
    return ["Document:", "{document}", "Task or question:", "{context}"]
  }
  if (/\bextract|json|fields|schema|parse\b/.test(d)) {
    return ["Schema hint: {schema}", "Text:", "{text}"]
  }
  if (/\bsummar|tldr|compress|brief\b/.test(d)) {
    return ["Content:", "{content}"]
  }
  if (/\bresearch|topic|investigate\b/.test(d)) {
    return ["Topic: {topic}", "Additional context:", "{context}"]
  }
  if (/\bemail|message|thread|letter\b/.test(d)) {
    return ["Message or thread:", "{content}", "Goal:", "{context}"]
  }
  return ["Input:", "{input}", "Context (optional):", "{context}"]
}

/** Build a starter prompt template from a short description and optional display name. */
export function draftAgentPromptFromDescription(input: AgentPromptDraftInput): string {
  const description = input.description?.trim()
  if (!description) return ""

  const role = rolePhrase(input.name)
  const focus = description.endsWith(".") ? description : `${description}.`
  const legal = includesLegalTopic(`${input.name ?? ""} ${description}`)

  const lines = [
    `You are ${role}. ${focus}`,
    legal ? "This is not legal advice — flag uncertainty and recommend professional review when needed." : null,
    "",
    "Guidelines:",
    "- Stay on scope and be direct.",
    "- Ask a clarifying question only when required context is missing.",
    "- Note uncertainty instead of guessing.",
    "",
    ...inputBlock(description),
  ].filter((line): line is string => line !== null)

  return lines.join("\n")
}
