"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Check, Code2, Copy } from "lucide-react"
import { useTheme } from "next-themes"
import { copyTextToClipboard } from "@/lib/chat-code-language"
import { codeBlockCssVars, codeViewerColorScheme } from "@/lib/masternode-editor-theme"
import {
  badgeLabelForCodeBlock,
  highlightCodeWithShiki,
  languageFromFence,
  type ShikiColorScheme,
} from "@/lib/shiki-highlighter"
import { cn } from "@/lib/utils"

/** Lazy to avoid circular import: code-block → preview → presentation panel → code-block. */
function HtmlPreviewAction({
  code,
  languageId,
}: {
  code: string
  languageId: string
}) {
  const [PreviewButton, setPreviewButton] = useState<ComponentType<{
    code: string
    languageId: string
    className?: string
  }> | null>(null)

  useEffect(() => {
    let cancelled = false
    void import("@/components/chat/chat-code-html-preview-button").then((mod) => {
      if (!cancelled) setPreviewButton(() => mod.ChatCodeHtmlPreviewButton)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!PreviewButton) return null
  return (
    <PreviewButton
      code={code}
      languageId={languageId}
      className="code-block__copy code-block__action--primary"
    />
  )
}

export interface CodeBlockProps {
  /** Raw source exactly as in the markdown fence (no fences). */
  code: string
  /** Optional explicit fence language (overrides className). */
  language?: string
  /** react-markdown `language-*` class from the fenced `<code>` element. */
  className?: string
  /** Optional filename shown in the header badge instead of the language label. */
  filename?: string
  /** When false, render plain monospace without Shiki. */
  highlight?: boolean
  compact?: boolean
  hidePreviewAction?: boolean
}

export function CodeBlock({
  code,
  language,
  className,
  filename,
  highlight = true,
  compact = false,
  hidePreviewAction = false,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [colorScheme, setColorScheme] = useState<ShikiColorScheme>("dark")

  useEffect(() => {
    const documentHasDarkClass = document.documentElement.classList.contains("dark")
    setColorScheme(codeViewerColorScheme({ resolvedTheme, documentHasDarkClass }))
  }, [resolvedTheme])

  const fenceLanguage = useMemo(() => {
    if (language?.trim()) return language.trim().toLowerCase()
    return languageFromFence(className)
  }, [language, className])

  const badgeLabel = useMemo(
    () => badgeLabelForCodeBlock(fenceLanguage, filename),
    [fenceLanguage, filename]
  )

  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!highlight) {
      setHtml(null)
      return
    }
    let cancelled = false
    void highlightCodeWithShiki(code, fenceLanguage, colorScheme)
      .then((out) => {
        if (!cancelled) setHtml(out)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [highlight, code, fenceLanguage, colorScheme])

  const handleCopy = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const ok = await copyTextToClipboard(code)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className={cn(
        "code-block group mb-3 overflow-hidden rounded-xl border shadow-sm",
        compact && "code-block--compact mb-0 rounded-lg"
      )}
      style={codeBlockCssVars(colorScheme) as CSSProperties}
      data-language={fenceLanguage ?? undefined}
      data-color-scheme={colorScheme}
    >
      <div className="code-block__header flex items-center justify-between gap-3 border-b">
        <span className="code-block__badge inline-flex min-w-0 items-center gap-2 text-xs font-medium">
          <Code2 className="code-block__badge-icon h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="code-block__title truncate">{badgeLabel}</span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {!hidePreviewAction && fenceLanguage ? (
            <HtmlPreviewAction code={code} languageId={fenceLanguage} />
          ) : null}
          <button
            type="button"
            onClick={(e) => void handleCopy(e)}
            className={cn(
              "code-block__copy inline-flex shrink-0 items-center gap-1.5 rounded-md border",
              "px-2.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div className="code-block__body">
        {highlight && html ? (
          <div className="code-block__shiki-root" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="code-block__pre">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

/** Extract fenced code props from a react-markdown `pre` child — no trimming. */
export function codePropsFromPreChildren(children: ReactNode): {
  code: string
  className?: string
} | null {
  const child = Array.isArray(children) ? children[0] : children
  if (!child || typeof child !== "object" || !("props" in child)) return null
  const props = (child as { props?: { className?: string; children?: unknown } }).props
  if (!props) return null
  const raw = props.children
  const code = String(Array.isArray(raw) ? raw.join("") : raw ?? "")
  return { code, className: props.className }
}
