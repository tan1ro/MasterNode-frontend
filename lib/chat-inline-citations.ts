import type { WebSearchSource } from "@/types/api"
import {
  groupSourcesBySite,
  siteLabelFromSource,
  type GroupedWebSearchSource,
} from "@/lib/chat-source-labels"
import { hostnameFromUrl } from "@/lib/chat-web-search-sources"

export interface MarkdownSection {
  headingLine: string | null
  body: string
}

export interface SectionWithCitations {
  section: MarkdownSection
  groups: GroupedWebSearchSource[]
}

/** Promote standalone bold lines to ATX headings so sections match LLM output. */
export function promoteBoldHeadings(content: string): string {
  return content.replace(/^\*\*([^*\n]+)\*\*\s*$/gm, "### $1")
}

export function splitMarkdownIntoSections(content: string): MarkdownSection[] {
  const normalized = promoteBoldHeadings(content)
  const lines = normalized.split("\n")
  const sections: MarkdownSection[] = []
  let heading: string | null = null
  let body: string[] = []

  const push = () => {
    const text = body.join("\n").trimEnd()
    if (!heading && !text) return
    sections.push({ headingLine: heading, body: text })
    heading = null
    body = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^#{1,6}\s/.test(trimmed)) {
      push()
      heading = trimmed
    } else {
      body.push(line)
    }
  }
  push()

  const trimmed = normalized.trim()
  return sections.length > 0 ? sections : [{ headingLine: null, body: trimmed }]
}

function sectionSearchText(section: MarkdownSection): string {
  return `${section.headingLine || ""}\n${section.body}`.toLowerCase()
}

function groupMatchesSection(group: GroupedWebSearchSource, text: string): boolean {
  const label = group.label.toLowerCase()
  if (label.length >= 4 && text.includes(label)) return true

  for (const source of group.sources) {
    const host = hostnameFromUrl(source.url).toLowerCase()
    if (!host) continue
    const bare = host.replace(/^www\./, "")
    const base = bare.split(".")[0] || ""
    if (bare.length >= 4 && text.includes(bare)) return true
    if (base.length >= 4 && text.includes(base)) return true
    const publisher = siteLabelFromSource(source).toLowerCase()
    if (publisher.length >= 4 && text.includes(publisher)) return true
    const withoutArticle = publisher.replace(/^the\s+/, "")
    if (withoutArticle.length >= 4 && text.includes(withoutArticle)) return true
  }
  return false
}

export function assignCitationGroupsToSections(
  sections: MarkdownSection[],
  sources: WebSearchSource[]
): SectionWithCitations[] {
  const allGroups = groupSourcesBySite(sources)
  if (allGroups.length === 0) {
    return sections.map((section) => ({ section, groups: [] }))
  }

  const used = new Set<string>()
  const assigned = sections.map((section) => {
    const text = sectionSearchText(section)
    const matched = allGroups.find((group) => {
      if (used.has(group.label)) return false
      return groupMatchesSection(group, text)
    })
    if (matched) used.add(matched.label)
    return { section, groups: matched ? [matched] : [] }
  })

  const unassigned = allGroups.filter((group) => !used.has(group.label))
  const openTargets = assigned
    .map((entry, index) => ({ index, eligible: Boolean(entry.section.body.trim()) }))
    .filter((entry) => entry.eligible)
    .map((entry) => entry.index)

  if (openTargets.length === 0) openTargets.push(0)

  unassigned.forEach((group, offset) => {
    const target = openTargets[offset % openTargets.length]
    if (assigned[target].groups.some((existing) => existing.label === group.label)) return
    assigned[target].groups.push(group)
    used.add(group.label)
  })

  if (used.size === 0 && allGroups.length > 0) {
    assigned[openTargets[0]].groups.push(allGroups[0])
  }

  return assigned
}

/** True when a section body is a single paragraph (inline pill can sit on the same line). */
export function isSingleParagraphBody(body: string): boolean {
  const text = body.trim()
  if (!text) return false
  if (/^[-*+]\s/m.test(text) || /^\d+\.\s/m.test(text)) return false
  if (text.includes("\n\n")) return false
  if (/\n[-*+]\s/.test(text) || /\n\d+\.\s/.test(text)) return false
  return true
}

export type CitationPlacement = "list" | "single-paragraph" | "paragraph" | "none"

export function citationPlacementForBody(body: string): CitationPlacement {
  const text = body.trim()
  if (!text) return "none"
  if (/^\d+\.\s/m.test(text) || /^[-*+]\s/m.test(text)) return "list"
  if (isSingleParagraphBody(text)) return "single-paragraph"
  return "paragraph"
}
