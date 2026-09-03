"use client"

import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import {
  ChatRichLinkCard,
  extractStandaloneMarkdownLink,
} from "@/components/chat/chat-rich-link-card"
import {
  ChatMarkdownAnchor,
  chatMarkdownComponentsForPrefs,
} from "@/components/markdown/markdown-components"
import { useChatDisplayPrefs } from "@/hooks/use-chat-display-prefs"
import { InlineCitationPillGroup } from "@/components/chat/chat-sources-panel"
import { InlineSourceLink } from "@/components/chat/inline-source-link"
import {
  assignCitationGroupsToSections,
  citationPlacementForBody,
  splitMarkdownIntoSections,
  type CitationPlacement,
} from "@/lib/chat-inline-citations"
import {
  isSourceUrl,
  replaceNumericCitationsWithMarkdownLinks,
} from "@/lib/chat-numbered-citations"
import { groupSourcesBySite } from "@/lib/chat-source-labels"
import { normalizeChatMarkdown, chatMarkdownUrlTransform } from "@/lib/chat-markdown"
import type { WebSearchSource } from "@/types/api"
import type { GroupedWebSearchSource } from "@/lib/chat-source-labels"
import { cn } from "@/lib/utils"

function withSourceLinkComponents(
  base: Components,
  sources: WebSearchSource[]
): Components {
  return {
    ...base,
    a: ({ href, children, node, ...props }) => {
      const source = href ? isSourceUrl(href, sources) : undefined
      if (source) {
        return <InlineSourceLink source={source}>{children}</InlineSourceLink>
      }
      return (
        <ChatMarkdownAnchor href={href} node={node} {...props}>
          {children}
        </ChatMarkdownAnchor>
      )
    },
  }
}

function buildCitationComponents(
  baseComponents: Components,
  groups: GroupedWebSearchSource[],
  placement: CitationPlacement,
  allSources: WebSearchSource[],
  messageId?: string
): Components {
  const base = withSourceLinkComponents(baseComponents, allSources)
  if (groups.length === 0) return base

  const pillGroup = (
    <InlineCitationPillGroup
      groups={groups}
      allSources={allSources}
      messageId={messageId}
      className="mt-0"
    />
  )

  let listPillsAttached = false
  const attachListPills = () => {
    if (placement !== "list" || listPillsAttached) return null
    listPillsAttached = true
    return pillGroup
  }

  const listWrapperClass = "mb-3 block min-w-0 w-full"

  return {
    ...base,
    p: ({ children }) => {
      const richLink = extractStandaloneMarkdownLink(children)
      if (richLink) {
        return <ChatRichLinkCard href={richLink.href} label={richLink.label} />
      }
      if (placement === "single-paragraph") {
        return (
          <p className="mb-3 text-base leading-[1.55] text-foreground/90 last:mb-0">
            {children}
            <span className="ml-1.5 inline-flex align-middle">{pillGroup}</span>
          </p>
        )
      }
      return (
        <p className="mb-3 text-base leading-[1.55] text-foreground/90 last:mb-0">
          {children}
        </p>
      )
    },
    ol: ({ children }) => {
      const pills = attachListPills()
      return (
        <div className={listWrapperClass}>
          <ol className="mb-0 ml-1 list-decimal space-y-1.5 pl-5 text-base leading-[1.55] text-foreground/90 marker:text-muted-foreground">
            {children}
          </ol>
          {pills ? (
            <div className="mt-2 flex w-full flex-wrap items-center gap-1.5">{pills}</div>
          ) : null}
        </div>
      )
    },
    ul: ({ children }) => {
      const pills = attachListPills()
      return (
        <div className={listWrapperClass}>
          <ul className="mb-0 ml-1 list-disc space-y-1.5 pl-5 text-base leading-[1.55] text-foreground/90 marker:text-emerald">
            {children}
          </ul>
          {pills ? (
            <div className="mt-2 flex w-full flex-wrap items-center gap-1.5">{pills}</div>
          ) : null}
        </div>
      )
    },
  }
}

function MarkdownSectionBlock({
  section,
  groups,
  allSources,
  messageId,
  baseComponents,
}: {
  section: { headingLine: string | null; body: string }
  groups: GroupedWebSearchSource[]
  allSources: WebSearchSource[]
  messageId?: string
  baseComponents: Components
}) {
  const body = section.body.trim()
  const placement = citationPlacementForBody(body)
  const components = buildCitationComponents(
    baseComponents,
    groups,
    placement,
    allSources,
    messageId
  )
  const headingComponents = withSourceLinkComponents(baseComponents, allSources)

  return (
    <div className="min-w-0 [&:not(:first-child)]:mt-[1.2em]">
      {section.headingLine ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={chatMarkdownUrlTransform}
          components={headingComponents}
        >
          {section.headingLine}
        </ReactMarkdown>
      ) : null}

      {body ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={chatMarkdownUrlTransform}
          components={components}
        >
          {body}
        </ReactMarkdown>
      ) : null}

      {placement === "paragraph" && groups.length > 0 ? (
        <div className="mb-3 flex w-full flex-wrap items-center gap-1.5">
          <InlineCitationPillGroup
            groups={groups}
            allSources={allSources}
            messageId={messageId}
          />
        </div>
      ) : null}
    </div>
  )
}

export function ChatMarkdownWithCitations({
  content,
  sources,
  messageId,
  className,
}: {
  content: string
  sources: WebSearchSource[]
  messageId?: string
  className?: string
}) {
  const { syntaxHighlighting } = useChatDisplayPrefs()
  const baseComponents = useMemo(
    () => chatMarkdownComponentsForPrefs(syntaxHighlighting),
    [syntaxHighlighting]
  )

  const preparedContent = useMemo(() => {
    const normalized = normalizeChatMarkdown(content)
    return replaceNumericCitationsWithMarkdownLinks(normalized, sources)
  }, [content, sources])

  const sections = useMemo(() => {
    const split = splitMarkdownIntoSections(preparedContent)
    return assignCitationGroupsToSections(split, sources)
  }, [preparedContent, sources])

  if (!sources.length) return null

  const hasInlinePills = sections.some((entry) => entry.groups.length > 0)
  const fallbackGroups = groupSourcesBySite(sources)

  return (
    <div className={cn("min-w-0", className)}>
      {sections.map((entry, index) => (
        <MarkdownSectionBlock
          key={`${entry.section.headingLine || "intro"}-${index}`}
          section={entry.section}
          groups={entry.groups}
          allSources={sources}
          messageId={messageId}
          baseComponents={baseComponents}
        />
      ))}
      {!hasInlinePills && fallbackGroups.length > 0 ? (
        <div className="mt-1 mb-3 flex w-full flex-wrap items-center gap-1.5">
          <InlineCitationPillGroup
            groups={fallbackGroups}
            allSources={sources}
            messageId={messageId}
          />
        </div>
      ) : null}
    </div>
  )
}
