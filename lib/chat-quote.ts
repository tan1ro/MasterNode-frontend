/** Format a user message that references a highlighted excerpt (markdown blockquote). */

import { detectCodeLanguage } from "@/lib/chat-code-language"

export function formatChatMessageWithQuote(quote: string, message: string): string {
  const excerpt = quote.trim()
  const body = message.trim()
  if (!excerpt) return body
  const block = excerpt
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")
  if (!body) return block
  return `${block}\n\n${body}`
}

/** Single-line preview for the composer quote chip. */
export function truncateQuotePreview(text: string, maxLen = 280): string {
  const normalized = text.trim().replace(/\s+/g, " ")
  if (normalized.length <= maxLen) return normalized
  return `${normalized.slice(0, maxLen - 1)}…`
}

export interface ParsedQuotedChatMessage {
  quote: string | null
  body: string
}

/**
 * Split a stored user message into leading markdown blockquote quote + ask body.
 * Compatible with {@link formatChatMessageWithQuote}.
 */
export function parseQuotedChatMessage(content: string): ParsedQuotedChatMessage {
  const text = (content || "").replace(/\r\n/g, "\n")
  if (!text.trim()) return { quote: null, body: "" }

  const lines = text.split("\n")
  const quoteLines: string[] = []
  let i = 0

  // Skip leading blank lines
  while (i < lines.length && !lines[i].trim()) i += 1

  while (i < lines.length) {
    const line = lines[i]
    if (/^>\s?/.test(line)) {
      quoteLines.push(line.replace(/^>\s?/, ""))
      i += 1
      continue
    }
    // Allow a blank line inside a quote block only if next line continues with >
    if (!line.trim() && i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) {
      quoteLines.push("")
      i += 1
      continue
    }
    break
  }

  if (quoteLines.length === 0) {
    return { quote: null, body: text.trim() }
  }

  const quote = quoteLines.join("\n").replace(/\n+$/, "")
  while (i < lines.length && !lines[i].trim()) i += 1
  const body = lines.slice(i).join("\n").trim()
  return { quote: quote || null, body }
}

/** Heuristic: treat multi-line quote as code when it looks like source. */
export function quoteLooksLikeCode(quote: string): boolean {
  const q = quote.trim()
  if (!q) return false
  if (q.includes("\n")) return true
  return (
    /^(def |class |function |const |let |var |import |from |#include|package |fn |pub )/m.test(
      q
    ) || /[{};=<>]/.test(q)
  )
}

/** Best-effort language id for quoted selections (no fence info). */
export function detectQuoteLanguage(quote: string): string {
  return detectCodeLanguage(quote)
}
