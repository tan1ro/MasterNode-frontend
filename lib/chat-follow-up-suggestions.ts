/** Contextual follow-up prompts after a web-grounded assistant reply (ChatGPT-style). */
export function getAssistantFollowUpSuggestions(
  userQuery: string,
  assistantContent: string,
  hadWebSearch: boolean
): string[] {
  if (!hadWebSearch || !assistantContent.trim()) return []

  const combined = `${userQuery}\n${assistantContent}`.toLowerCase()
  const suggestions: string[] = []

  if (/workout|fitness|training plan|recomposition|macros|sets\s*x\s*reps|gym plan/i.test(combined)) {
    suggestions.push("Adjust for home workouts")
    suggestions.push("Create a meal prep list")
    if (/pdf|docx|download|export/i.test(assistantContent)) {
      suggestions.push("Yes, as DOCX")
    } else {
      suggestions.push("Export as DOCX")
    }
    return suggestions.slice(0, 3)
  }

  suggestions.push("Tell me in detail")
  suggestions.push("Dig deeper")

  if (/restaurant|dining|food|cafe|bar|eat|lunch|dinner|rr nagar|bangalore.*eat/i.test(combined)) {
    suggestions.push("Which one do you recommend?")
    suggestions.push("Compare the top options")
  } else if (/pdf|docx|download|export.*plan|need a pdf/i.test(assistantContent)) {
    suggestions.push("Yes, as DOCX")
  } else if (assistantContent.length > 400) {
    suggestions.push("Summarize the key points")
  }

  const unique: string[] = []
  const seen = new Set<string>()
  for (const item of suggestions) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
    if (unique.length >= 3) break
  }
  return unique
}
