/** Parse `@` mention queries in the chat composer textarea. */

export interface MentionQuery {
  /** Index of the `@` that started this mention. */
  start: number
  /** Caret / end of the query (exclusive of trailing text). */
  end: number
  /** Text after `@` (may be empty). */
  query: string
}

/**
 * Find an active `@mention` query ending at `caret`.
 * Mentions start after whitespace/start and stop at whitespace.
 */
export function findMentionQuery(
  value: string,
  caret: number
): MentionQuery | null {
  const end = Math.max(0, Math.min(caret, value.length))
  const before = value.slice(0, end)
  const at = before.lastIndexOf("@")
  if (at < 0) return null
  if (at > 0) {
    const prev = before[at - 1]
    if (prev && !/\s/.test(prev)) return null
  }
  const query = before.slice(at + 1)
  if (/[\s\n]/.test(query)) return null
  return { start: at, end, query }
}

/** Remove the active `@query` from the value and return the new caret. */
export function removeMentionQuery(
  value: string,
  mention: MentionQuery
): { nextValue: string; cursor: number } {
  const nextValue = `${value.slice(0, mention.start)}${value.slice(mention.end)}`
  return { nextValue, cursor: mention.start }
}

export type MentionKind = "file" | "assistant"

export interface MentionCandidate {
  kind: MentionKind
  id: string
  label: string
  detail?: string
}

export function filterMentionCandidates(
  items: MentionCandidate[],
  query: string,
  limit = 8
): MentionCandidate[] {
  const q = query.trim().toLowerCase()
  const scored = items
    .map((item) => {
      const label = item.label.toLowerCase()
      const detail = (item.detail || "").toLowerCase()
      if (!q) return { item, score: 0 }
      if (label.startsWith(q)) return { item, score: 0 }
      if (label.includes(q)) return { item, score: 1 }
      if (detail.includes(q)) return { item, score: 2 }
      return null
    })
    .filter(Boolean) as { item: MentionCandidate; score: number }[]
  scored.sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label))
  return scored.slice(0, limit).map((s) => s.item)
}
