import React from "react"
import type { Components } from "react-markdown"
import {
  ChatRichLinkCard,
  extractStandaloneMarkdownLink,
} from "@/components/chat/chat-rich-link-card"
import { CodeBlock, codePropsFromPreChildren } from "@/components/code/code-block"
import { normalizeExternalHref } from "@/lib/chat-markdown"
import { cn } from "@/lib/utils"

const chatLinkClassName =
  "relative z-[1] cursor-pointer pointer-events-auto font-medium text-amber underline decoration-amber/40 underline-offset-2 transition-colors hover:text-amber/90"

/** Chat / markdown anchors — always open in a new tab with an absolute http(s) href. */
export function ChatMarkdownAnchor({
  href,
  children,
  className,
  node: _node,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }) {
  const safeHref = normalizeExternalHref(typeof href === "string" ? href : undefined)
  if (!safeHref) {
    return <span className={className}>{children}</span>
  }

  const isHttp = /^https?:\/\//i.test(safeHref)

  return (
    <a
      {...props}
      href={safeHref}
      className={cn(chatLinkClassName, className)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
        if (event.defaultPrevented) return
        if (!isHttp) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        window.open(safeHref, "_blank", "noopener,noreferrer")
      }}
    >
      {children}
    </a>
  )
}

const chatInlineCodeClassName = "font-mono text-[0.95em] text-foreground/90"

function makePreRenderer(opts: {
  highlight: boolean
  compact?: boolean
  fallbackClassName: string
}): Components["pre"] {
  function MarkdownPre({ children }: { children?: React.ReactNode }) {
    const extracted = codePropsFromPreChildren(children)
    if (extracted && (extracted.className?.includes("language-") || extracted.code.includes("\n"))) {
      return (
        <CodeBlock
          code={extracted.code}
          className={extracted.className}
          highlight={opts.highlight}
          compact={opts.compact}
        />
      )
    }
    return <pre className={opts.fallbackClassName}>{children}</pre>
  }
  MarkdownPre.displayName = "MarkdownPre"
  return MarkdownPre
}

/** Shared Markdown mapping for chat, agent output, and task result overview (GFM tables, lists, etc.). */
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading text-xl font-bold tracking-tight text-foreground first:mt-0 mt-8 mb-3">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-lg font-semibold text-foreground mt-8 first:mt-0 mb-2.5 border-b border-border/60 pb-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-relaxed text-foreground/90 mb-3.5 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-1 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/90 marker:text-emerald">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-1 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/90 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-0.5 [&>ul]:mt-1.5 [&>ul]:mb-0 [&>ul]:list-[circle] [&>ul]:marker:text-muted-foreground/80">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground/95">{children}</em>,
  a: (props) => <ChatMarkdownAnchor {...props} />,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-[3px] border-emerald/35 bg-emerald/[0.06] py-2 pl-4 pr-2 text-[15px] leading-relaxed text-foreground/85 rounded-r-md">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border/70" />,
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className || "")
    if (!isBlock) {
      return (
        <code
          className="rounded-md bg-muted/90 px-1.5 py-0.5 font-mono text-[0.88em] text-foreground"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={cn("font-mono text-sm", className)} {...props}>
        {children}
      </code>
    )
  },
  pre: makePreRenderer({
    highlight: true,
    fallbackClassName:
      "mb-4 overflow-x-auto rounded-lg border border-border/50 bg-muted/35 p-4 text-sm leading-relaxed",
  }),
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
  tr: ({ children }) => <tr className="border-border/40">{children}</tr>,
  th: ({ children }) => (
    <th className="border-b border-border/60 px-3 py-2 font-heading font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2 text-foreground/90 align-top">{children}</td>,
}

const chatBodyClass = "text-base leading-[1.55] text-foreground/90 mb-3 last:mb-0"

/** Markdown mapping for the main /chat thread (matches CHAT_MESSAGE_TEXT_CLASS).
 * Vertical gaps are also capped in globals.css (.chat-pref-font-size) to Claude’s rhythm.
 */
export const chatMarkdownComponents: Components = {
  ...markdownComponents,
  h1: ({ children }) => (
    <h1 className="font-heading text-xl font-bold tracking-tight text-foreground first:mt-0 mt-5 mb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-lg font-semibold text-foreground mt-5 first:mt-0 mb-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-1.5">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h4>
  ),
  hr: () => <hr className="my-4 border-border/70" />,
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className || "")
    if (!isBlock) {
      return (
        <code className={chatInlineCodeClassName} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={cn("font-mono text-sm", className)} {...props}>
        {children}
      </code>
    )
  },
  p: ({ children }) => {
    const richLink = extractStandaloneMarkdownLink(children)
    if (richLink) {
      return <ChatRichLinkCard href={richLink.href} label={richLink.label} />
    }
    return <p className={chatBodyClass}>{children}</p>
  },
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 list-disc space-y-1.5 pl-5 text-base leading-[1.55] text-foreground/90 marker:text-emerald">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-decimal space-y-1.5 pl-5 text-base leading-[1.55] text-foreground/90 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-[3px] border-emerald/35 bg-emerald/[0.06] py-1.5 pl-4 pr-2 text-base leading-[1.55] text-foreground/85 rounded-r-md">
      {children}
    </blockquote>
  ),
  pre: makePreRenderer({
    highlight: true,
    fallbackClassName:
      "mb-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/35 p-3 text-sm leading-relaxed",
  }),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
}

/** Chat markdown components with optional syntax highlighting in code blocks. */
export function chatMarkdownComponentsForPrefs(syntaxHighlighting = true): Components {
  return {
    ...chatMarkdownComponents,
    pre: makePreRenderer({
      highlight: syntaxHighlighting,
      fallbackClassName: syntaxHighlighting
        ? "mb-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/35 p-3 text-sm leading-relaxed"
        : "mb-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/35 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap",
    }),
  }
}

/** Slightly smaller markdown for inline pipeline research / document output in chat. */
export const pipelineDocumentMarkdownComponents: Components = {
  ...markdownComponents,
  h1: ({ children }) => (
    <h1 className="font-heading text-lg font-bold tracking-tight text-foreground first:mt-0 mt-6 mb-2.5">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-base font-semibold text-foreground mt-6 first:mt-0 mb-2 border-b border-border/60 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xs font-semibold text-foreground mt-3 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-[13px] leading-relaxed text-foreground/90 mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-foreground/90 marker:text-emerald">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-foreground/90 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-[3px] border-emerald/35 bg-emerald/[0.06] py-1.5 pl-3 pr-2 text-[13px] leading-relaxed text-foreground/85 rounded-r-md">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-border/70" />,
  pre: makePreRenderer({
    highlight: true,
    compact: true,
    fallbackClassName:
      "mb-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/35 p-3 text-xs leading-relaxed",
  }),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[240px] border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border/60 px-2.5 py-1.5 text-xs font-heading font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2.5 py-1.5 text-xs text-foreground/90 align-top">{children}</td>
  ),
}

/** @deprecated Import from `@/components/markdown/support-markdown-components` */
export { supportMarkdownComponents } from "@/components/markdown/support-markdown-components"

/** @deprecated Use markdownComponents */
export const agentResultMarkdownComponents = markdownComponents
