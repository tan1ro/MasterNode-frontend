import React, { Fragment, type ReactNode } from "react"

/**
 * Render lightweight inline markdown (`**bold**`, `*italic*`, `` `code` ``)
 * as React nodes. Used for pipeline plan todos that LLMs often format with
 * markdown but are shown outside a full markdown renderer.
 */
export function renderInlineMarkdown(text: string): ReactNode {
  const source = text ?? ""
  if (!source) return null

  // Bold / italic / code — non-greedy; order matters (code first, then bold, then italic).
  const tokenRe = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenRe.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={`t-${key++}`}>{source.slice(lastIndex, match.index)}</Fragment>
      )
    }
    const token = match[0]
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`t-${key++}`}
          className="rounded px-1 py-0.5 font-mono text-[0.92em] bg-muted/60 text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      parts.push(
        <strong key={`t-${key++}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      parts.push(
        <em key={`t-${key++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      parts.push(<Fragment key={`t-${key++}`}>{token}</Fragment>)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < source.length) {
    parts.push(<Fragment key={`t-${key++}`}>{source.slice(lastIndex)}</Fragment>)
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

/** Strip common inline markdown markers to plain text (aria / titles). */
export function stripInlineMarkdown(text: string): string {
  return (text ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim()
}
