"use client"

import type { Components } from "react-markdown"
import { cn } from "@/lib/utils"

/**
 * Compact markdown for the floating support chat.
 * Intentionally avoids CodeBlock/Shiki so the root layout never pulls Shiki
 * into the critical client graph (that caused Element type invalid / 500s).
 */
export const supportMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading text-base font-bold text-foreground first:mt-0 mt-3 mb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-sm font-semibold text-foreground mt-3 first:mt-0 mb-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-foreground mt-2.5 mb-1">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xs font-semibold text-foreground mt-2 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-foreground/90 mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground/90 marker:text-cyan">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-1 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-foreground/90">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-[1] cursor-pointer pointer-events-auto font-medium text-cyan underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children }) => {
    const isBlock = typeof className === "string" && className.includes("language-")
    if (isBlock) {
      return <code className={className}>{children}</code>
    }
    return (
      <code
        className={cn(
          "rounded bg-muted/60 px-1 py-0.5 font-mono text-[0.9em] text-foreground/90"
        )}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-md border border-border/50 bg-background/60 p-2.5 text-xs leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-cyan/40 pl-3 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border/60" />,
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[200px] border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border/60 px-2 py-1.5 font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 align-top text-foreground/90">{children}</td>
  ),
}
