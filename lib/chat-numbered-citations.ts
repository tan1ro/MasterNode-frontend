import type { WebSearchSource } from "@/types/api"
import { siteLabelFromSource } from "@/lib/chat-source-labels"

/** Max numeric refs in one `[1, 2, 3]` group — larger groups are data arrays, not citations. */
const MAX_CITATION_GROUP = 4

function sourceMarkdownLink(sources: WebSearchSource[], index: number): string | null {
  if (index < 1 || index > sources.length) return null
  const source = sources[index - 1]
  const url = source?.url?.trim()
  if (!url) return null
  const label = siteLabelFromSource(source)
  // Brackets inside the label break markdown link parsing.
  const safeLabel = label.replace(/[\[\]]/g, "").trim() || "Source"
  return `[${safeLabel}](${url})`
}

/**
 * Apply a text transform only outside fenced/inline code so citation rewriting
 * cannot mangle arrays like `[1, 5, 2]` inside backticks.
 */
export function mapOutsideMarkdownCode(
  text: string,
  transform: (chunk: string) => string
): string {
  if (!text) return text
  const re = /```[\s\S]*?```|`[^`\n]+`/g
  let out = ""
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    out += transform(text.slice(last, match.index))
    out += match[0]
    last = match.index + match[0].length
  }
  out += transform(text.slice(last))
  return out
}

function replaceBracketCitations(text: string, sources: WebSearchSource[]): string {
  return text.replace(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g, (match, group: string) => {
    const indices = group.split(",").map((part) => parseInt(part.trim(), 10))
    if (indices.length === 0 || indices.length > MAX_CITATION_GROUP) return match
    // Require every index to be a real source — avoids half-rewriting data arrays.
    const links = indices.map((index) => sourceMarkdownLink(sources, index))
    if (links.some((link) => !link)) return match
    return ` ${links.join(" ")}`
  })
}

/** Trailing footnote style: "…points table 1." → markdown link when index is valid. */
function replaceTrailingNumericCitations(text: string, sources: WebSearchSource[]): string {
  return text.replace(/(\S)\s+(\d{1,2})\.(?=\s|$)/g, (match, word: string, numStr: string) => {
    // Algorithm / math traces: "→ 9." or "= 4." are not footnotes.
    if (/^[→⟶⇐⇒≈=<>+\-*/]$/.test(word)) return match
    const link = sourceMarkdownLink(sources, parseInt(numStr, 10))
    return link ? `${word} ${link}` : match
  })
}

/**
 * Convert LLM numbered citations ([1], [1, 3], trailing " 1.") into markdown links
 * that the UI renders as favicon source pills.
 */
export function replaceNumericCitationsWithMarkdownLinks(
  content: string,
  sources: WebSearchSource[]
): string {
  if (!content.trim() || sources.length === 0) return content
  return mapOutsideMarkdownCode(content, (chunk) => {
    let out = replaceBracketCitations(chunk, sources)
    out = replaceTrailingNumericCitations(out, sources)
    return out
  })
}

/**
 * Join markdown links whose URLs were soft-wrapped across lines by the model.
 * Example: `[Label](https://example.com/path-\nmore)` → one valid link.
 */
export function joinBrokenMarkdownLinks(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_match, label: string, url: string) => {
      const compact = url.replace(/\s+/g, "")
      return `[${label}](${compact})`
    }
  )
}

export function isSourceUrl(href: string, sources: WebSearchSource[]): WebSearchSource | undefined {
  const normalized = href.trim().replace(/\/$/, "")
  return sources.find((source) => {
    const url = source.url?.trim().replace(/\/$/, "")
    return url && url === normalized
  })
}
