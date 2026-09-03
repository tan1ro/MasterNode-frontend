/** Turn raw SSE / provider errors into short, user-safe chat copy. */
export function formatChatStreamError(raw: string): string {
  const text = (raw || "").trim()
  if (!text) {
    return "I couldn't generate a reply right now. Please try again in a moment."
  }

  const lower = text.toLowerCase()

  if (lower.includes("ratelimit") || lower.includes("rate limit") || lower.includes("rate-limited")) {
    const retry = parseRetryAfterSeconds(text)
    if (retry) {
      return `The AI service is temporarily busy. Please wait about ${retry} seconds and try again.`
    }
    return "The AI service is temporarily busy. Please wait a moment and try again."
  }

  if (text.includes("429")) {
    return "The AI service is temporarily busy. Please wait a moment and try again."
  }

  if (lower.includes("all chat streaming providers failed")) {
    return "I couldn't reach the AI service right now. Please try again in a moment, or switch models in Settings if this keeps happening."
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The request timed out. Please try again."
  }

  if (
    lower.includes("unauthorized") ||
    lower.includes("invalid api key") ||
    lower.includes("authentication")
  ) {
    return "The AI service isn't configured correctly. Check your API keys in Settings or contact your admin."
  }

  if (lower.includes("connection") || lower.includes("network")) {
    return "I couldn't connect to the AI service. Check your network and try again."
  }

  if (
    text.length > 180 ||
    lower.includes("litellm") ||
    lower.includes("openrouter") ||
    lower.includes("exception")
  ) {
    return "Something went wrong while generating a reply. Please try again."
  }

  return text
}

function parseRetryAfterSeconds(raw: string): number | null {
  const match = raw.match(/"retry_after_seconds"\s*:\s*(\d+)/)
  if (match) return Math.max(1, Number(match[1]))
  return null
}

export function isAssistantErrorMessage(content: string): boolean {
  const c = content.trim()
  if (!c) return false
  return (
    c.startsWith("I hit a streaming error:") ||
    c.startsWith("The AI service is temporarily busy") ||
    c.startsWith("I couldn't reach the AI service") ||
    c.startsWith("Something went wrong while generating a reply") ||
    c.startsWith("I couldn't generate a reply") ||
    c.includes("litellm.RateLimitError")
  )
}
