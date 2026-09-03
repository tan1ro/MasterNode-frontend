/** Default max length for task titles in lists and dialogs. */
export const TASK_SHORT_LABEL_MAX = 72

/**
 * Short label for UI: first non-empty line, whitespace collapsed, then truncated.
 * Full text stays on the task record; use this for cards, headers, and confirmations.
 */
export function getTaskShortLabel(text: string, maxLength = TASK_SHORT_LABEL_MAX): string {
  const raw = text?.trim() ?? ""
  if (!raw) return "Untitled task"
  const firstLine = raw.split(/\r?\n/).find((l) => l.trim().length > 0) ?? raw
  const collapsed = firstLine.replace(/\s+/g, " ").trim()
  if (collapsed.length <= maxLength) return collapsed
  const cut = collapsed.slice(0, maxLength - 1).trimEnd()
  return `${cut}…`
}
