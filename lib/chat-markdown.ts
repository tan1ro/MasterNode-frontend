/**
 * Normalize assistant chat text for ReactMarkdown + remark-gfm.
 * Fixes over-escaped newlines and tab-separated "tables" common in LLM output.
 */

function stripOuterMarkdownFence(s: string): string {
  const t = s.trim()
  const m = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i)
  if (m?.[1]) return m[1].trim()
  return s
}

function unescapeLiteralNewlines(s: string): string {
  let t = s
  const realNewlines = (t.match(/\n/g) || []).length
  const literalEscNewlines = (t.match(/\\n/g) || []).length
  if (literalEscNewlines >= 2 && literalEscNewlines > realNewlines) {
    t = t.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\\t/g, "\t")
  }
  return t
}

function isTabularLine(line: string): boolean {
  if (!line.includes("\t")) return false
  const cells = line.split("\t").map((c) => c.trim())
  return cells.length >= 2 && cells.every((c) => c.length > 0)
}

function tabBlockToMarkdownTable(rows: string[]): string {
  const parsed = rows.map((r) => r.split("\t").map((c) => c.trim()))
  const colCount = Math.max(...parsed.map((r) => r.length))
  const pad = (cells: string[]) => {
    const next = [...cells]
    while (next.length < colCount) next.push("")
    return next.slice(0, colCount)
  }
  const escapeCell = (cell: string) => cell.replace(/\|/g, "\\|")
  const mdRows = parsed.map((cells) => `| ${pad(cells).map(escapeCell).join(" | ")} |`)
  if (mdRows.length === 0) return rows.join("\n")
  if (mdRows.length === 1) return mdRows[0]
  const sep = `| ${Array(colCount).fill("---").join(" | ")} |`
  return [mdRows[0], sep, ...mdRows.slice(1)].join("\n")
}

const GFM_SEP_CELL = /^\s*:?-{3,}:?\s*$/

function splitPipeCells(segment: string): string[] {
  const trimmed = segment.trim().replace(/^\|/, "").replace(/\|$/, "")
  if (!trimmed) return []
  return trimmed.split("|").map((c) => c.trim())
}

function formatPipeRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`
}

function looksLikeCollapsedPipeTableLine(line: string): boolean {
  const pipes = (line.match(/\|/g) || []).length
  if (pipes < 8) return false
  const hasSep = /\|?\s*:?-{3,}:?\s*\|/.test(line)
  if (!hasSep) return false
  // Separator shares the line with real cell content (common LLM / streaming glitch).
  const withoutSep = line.replace(/(?:\|\s*)?(?:\|?\s*:?-{3,}:?\s*)+\|/g, " ")
  return withoutSep.replace(/\|/g, "").trim().length > 3
}

function dropArtifactualEmptyCells(cells: string[]): string[] {
  // Collapsed tables insert empty cells at `| |---` / `| | row` boundaries.
  // Dropping empties is safer than shifting columns; pad() restores width.
  return cells.filter((c) => c !== "")
}

/**
 * Rebuild a GFM table when the model (or streaming) collapses header / separator /
 * body rows onto a single line, e.g.
 * `| A | B | |---|---| | r1c1 | r1c2 | | r2c1 | r2c2 |`
 */
export function repairCollapsedPipeTableLine(line: string): string {
  if (!looksLikeCollapsedPipeTableLine(line)) return line

  const cells = splitPipeCells(line)
  if (cells.length < 4) return line

  let sepStart = -1
  let sepEnd = -1
  for (let i = 0; i < cells.length; i++) {
    if (!GFM_SEP_CELL.test(cells[i])) continue
    if (sepStart < 0) sepStart = i
    sepEnd = i
  }
  if (sepStart < 0 || sepEnd < sepStart) return line

  while (sepStart > 0 && GFM_SEP_CELL.test(cells[sepStart - 1])) sepStart -= 1
  while (sepEnd + 1 < cells.length && GFM_SEP_CELL.test(cells[sepEnd + 1])) sepEnd += 1

  const headerCells = dropArtifactualEmptyCells(cells.slice(0, sepStart))
  const sepCells = cells.slice(sepStart, sepEnd + 1).filter((c) => GFM_SEP_CELL.test(c))
  const bodyCells = dropArtifactualEmptyCells(cells.slice(sepEnd + 1))

  const colCount = Math.max(headerCells.length, sepCells.length, 1)
  if (headerCells.length === 0 || bodyCells.length === 0) return line

  const pad = (row: string[]) => {
    const next = [...row]
    while (next.length < colCount) next.push("")
    return next.slice(0, colCount)
  }

  const rows: string[] = [
    formatPipeRow(pad(headerCells)),
    formatPipeRow(Array(colCount).fill("---")),
  ]

  for (let i = 0; i < bodyCells.length; i += colCount) {
    const chunk = bodyCells.slice(i, i + colCount)
    if (chunk.length === 0) continue
    rows.push(formatPipeRow(pad(chunk)))
  }

  return rows.join("\n")
}

export function repairCollapsedPipeTables(text: string): string {
  return text
    .split("\n")
    .map((line) => repairCollapsedPipeTableLine(line))
    .join("\n")
}

/** GFM tables need a blank line before the opening `|` row. */
function ensureBlankLineBeforeTables(text: string): string {
  const lines = text.split("\n")
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = out[out.length - 1]
    const isTableRow = /^\s*\|/.test(line)
    const prevIsTableRow = prev !== undefined && /^\s*\|/.test(prev)
    const prevIsEmpty = prev === undefined || prev.trim() === ""
    if (isTableRow && prev !== undefined && !prevIsEmpty && !prevIsTableRow) {
      out.push("")
    }
    out.push(line)
  }
  return out.join("\n")
}

export function convertTabSeparatedTables(text: string): string {
  const lines = text.split("\n")
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    if (isTabularLine(lines[i])) {
      const block: string[] = []
      while (i < lines.length && isTabularLine(lines[i])) {
        block.push(lines[i])
        i += 1
      }
      out.push(tabBlockToMarkdownTable(block))
      continue
    }
    out.push(lines[i])
    i += 1
  }
  return out.join("\n")
}

/** Ensure ATX headings and numbered section titles start after a blank line. */
function ensureBlockSpacing(text: string): string {
  return text
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(\d+\.\s+[A-Z])/g, "$1\n\n$2")
}

const SWOT_SECTION_LABELS = ["Strengths", "Weaknesses", "Opportunities", "Threats"] as const

function formatSwotSectionHeadings(text: string): string {
  let t = text
  for (const label of SWOT_SECTION_LABELS) {
    t = t.replace(new RegExp(`\\n${label}\\s*\\n`, "g"), `\n### ${label}\n\n`)
  }
  return t
}

/** "Telecom Dominance: ..." → bullet; skip numbered section titles and existing markdown. */
function bulletizeLabelColonLines(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      if (/^\s*[-*#|]/.test(trimmed)) return line
      if (/^\d+\.\s/.test(trimmed)) return line
      const m = trimmed.match(/^([A-Z][A-Za-z0-9 &/().-]+):\s+(.+)$/)
      if (!m) return line
      return `- **${m[1]}:** ${m[2]}`
    })
    .join("\n")
}

/** "A. The Tier-1 Giants" → ### subsection heading */
function formatLetteredSubsections(text: string): string {
  return text.replace(/^([A-Z])\.\s+(.+)$/gm, "### $1. $2")
}

/** "**Key differences**:" on its own line → ### heading */
function formatBoldStandaloneLabels(text: string): string {
  return text.replace(/^\*\*([^*\n]+)\*\*:?\s*$/gm, "### $1")
}

/** GFM requires a blank line before lists; LLMs often omit it after headings or bold labels. */
function ensureBlankLineBeforeLists(text: string): string {
  const lines = text.split("\n")
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = out[out.length - 1]
    const isList = /^\s*[-*+]\s+/.test(line)
    const prevIsList = prev !== undefined && /^\s*[-*+]\s+/.test(prev)
    const prevIsEmpty = prev === undefined || prev.trim() === ""
    const prevIsHeading = prev !== undefined && /^\s*#{1,6}\s+/.test(prev)
    if (isList && prev !== undefined && !prevIsEmpty && !prevIsList && !prevIsHeading) {
      out.push("")
    }
    if (isList && prevIsHeading) {
      out.push("")
    }
    out.push(line)
  }
  return out.join("\n")
}

/**
 * Comparison bullets often bold every phrase (`- **A**: **foo** and **bar**`).
 * Keep the list label bold; strip extra bold in the description for readability.
 */
function softenExtraBoldInListItems(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const m = line.match(/^(\s*[-*+]\s+\*\*[^*]+\*\*:?\s*)(.+)$/)
      if (!m) return line
      const label = m[1].trimEnd().replace(/:\s*$/, "")
      const body = m[2].replace(/\*\*([^*]+)\*\*/g, "$1")
      return `${label} ${body}`.replace(/\s{2,}/g, " ")
    })
    .join("\n")
}

/** Remove redundant "(publisher: …)" metadata — source pills carry publisher names. */
export function stripPublisherParentheticals(text: string): string {
  return text.replace(/\s*\([Pp]ublisher:\s*[^)]+\)/g, "")
}

/**
 * Make markdown `href`s safe to open from chat.
 * Bare domains (`github.com/x`) otherwise navigate inside the app and look broken.
 */
export function normalizeExternalHref(href: string | undefined | null): string | undefined {
  if (href == null) return undefined
  const trimmed = href.trim()
  if (!trimmed) return undefined
  if (
    trimmed.startsWith("#") ||
    /^(mailto|tel|sms):/i.test(trimmed) ||
    trimmed.startsWith("/")
  ) {
    return trimmed
  }
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith("//")) return `https:${trimmed}`
  if (
    /^(www\.|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}([/:?#].*)?$/i.test(trimmed) &&
    !/\s/.test(trimmed)
  ) {
    return `https://${trimmed}`
  }
  return trimmed
}

/** react-markdown `urlTransform` — keep http(s) and prefix https for bare domains. */
export function chatMarkdownUrlTransform(url: string): string {
  return normalizeExternalHref(url) ?? ""
}

/** Turn bare domains after an em dash into markdown links. */
export function linkifyBareDomains(text: string): string {
  return text.replace(
    /([—–-])\s+((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s,;)]*)?)/gi,
    (_match, dash: string, rawUrl: string) => {
      const href = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
      const display = rawUrl.replace(/^https?:\/\//i, "")
      return `${dash} [${display}](${href})`
    }
  )
}

/** Autolink leftover http(s)/www URLs that are not already markdown links. */
export function linkifyBareHttpUrls(text: string): string {
  return text.replace(
    /(?<!\]\()(?:https?:\/\/[^\s<>\[\]"]+|(?<![:/])www\.[^\s<>\[\]"]+)/gi,
    (raw) => {
      const punct = raw.match(/[.,;:!?)]+$/)
      const url = punct ? raw.slice(0, -punct[0].length) : raw
      const trailing = punct ? punct[0] : ""
      if (!url) return raw
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
      return `[${url}](${href})${trailing}`
    }
  )
}

/**
 * Profile-style replies often nest link bullets under a bio line.
 * Flatten to a short intro paragraph plus top-level link bullets.
 */
export function flattenProfileLinkBullets(text: string): string {
  const lines = text.split("\n")
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const topBullet = line.match(/^(\s*)[-*+]\s+(.+)$/)
    if (!topBullet) {
      out.push(line)
      i += 1
      continue
    }

    const parentIndent = topBullet[1].length
    let j = i + 1
    const nested: string[] = []
    while (j < lines.length) {
      const nestedLine = lines[j]
      const nestedBullet = nestedLine.match(/^(\s*)[-*+]\s+(.+)$/)
      if (!nestedBullet || nestedBullet[1].length <= parentIndent) break
      nested.push(nestedBullet[2].trim())
      j += 1
    }

    if (nested.length === 0) {
      out.push(line)
      i += 1
      continue
    }

    const looksLikeLinks = nested.every((item) => /^[^:\n]{1,48}:\s+.+/.test(item))
    if (!looksLikeLinks) {
      out.push(line)
      i += 1
      continue
    }

    out.push(topBullet[2].trim())
    out.push("")
    for (const item of nested) {
      const labeled = item.replace(/^([^:]+):\s*/, "**$1:** ")
      out.push(`- ${labeled}`)
    }
    i = j
  }

  return out.join("\n")
}

export function normalizeChatMarkdown(s: string): string {
  let t = stripOuterMarkdownFence(s.trim())
  t = unescapeLiteralNewlines(t)
  t = convertTabSeparatedTables(t)
  t = repairCollapsedPipeTables(t)
  t = stripPublisherParentheticals(t)
  t = flattenProfileLinkBullets(t)
  t = linkifyBareDomains(t)
  // Soft-wrapped URLs inside [label](url) break CommonMark link parsing.
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_match, label: string, url: string) => `[${label}](${url.replace(/\s+/g, "")})`
  )
  t = linkifyBareHttpUrls(t)
  t = formatLetteredSubsections(t)
  t = formatSwotSectionHeadings(t)
  t = bulletizeLabelColonLines(t)
  t = formatBoldStandaloneLabels(t)
  t = softenExtraBoldInListItems(t)
  t = ensureBlankLineBeforeLists(t)
  t = ensureBlankLineBeforeTables(t)
  t = ensureBlockSpacing(t)
  return t
}

/** Single-line plain text for search previews and compact snippets (no raw markdown). */
export function plainTextFromChatContent(content: string): string {
  let t = (content || "").trim()
  if (!t) return ""

  t = t.replace(/```[\s\S]*?```/g, " ")
  t = t.replace(/`([^`]+)`/g, "$1")
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1")
  t = t.replace(/__([^_]+)__/g, "$1")
  t = t.replace(/\*([^*]+)\*/g, "$1")
  t = t.replace(/_([^_]+)_/g, "$1")
  t = t.replace(/~~([^~]+)~~/g, "$1")
  t = t.replace(/^#{1,6}\s+/gm, "")
  t = t.replace(/^>\s?/gm, "")
  t = t.replace(/^\s*[-*+]\s+/gm, "")
  t = t.replace(/^\s*\d+\.\s+/gm, "")
  t = t.replace(/^[-*_]{3,}\s*$/gm, " ")

  return t.replace(/\s+/g, " ").trim()
}
