const PPT_KEYWORDS = [
  "ppt",
  "pptx",
  "powerpoint",
  "presentation",
  "slide deck",
  "slides",
  "deck",
] as const

const PPT_VERBS = [
  "create",
  "make",
  "build",
  "generate",
  "design",
  "prepare",
  "draft",
  "produce",
] as const

/** Match backend `is_presentation_request` so PPT prompts use the direct generator. */
export function isPresentationRequest(message: string): boolean {
  const text = (message || "").trim().toLowerCase()
  if (!text) return false
  const hasKeyword = PPT_KEYWORDS.some((keyword) => text.includes(keyword))
  if (!hasKeyword) return false
  if (PPT_VERBS.some((verb) => text.includes(verb))) return true
  return text.includes("ppt") || text.includes("powerpoint") || text.includes("presentation")
}
