"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { exportMarkdownAsDocument } from "@/lib/document-export"
import {
  applyDocumentPlaceholders,
  resolveAuthorFromUser,
} from "@/lib/document-placeholders"
import { useAppAuth } from "@/hooks/use-app-auth"
import { cn } from "@/lib/utils"

interface ChatDocumentActionsProps {
  markdown: string
  title?: string
  className?: string
}

export function ChatDocumentActions({ markdown, title, className }: ChatDocumentActionsProps) {
  const { user } = useAppAuth()
  const [loading, setLoading] = useState<"docx" | "pdf" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const author = useMemo(() => resolveAuthorFromUser(user), [user])
  const preparedMarkdown = useMemo(
    () => applyDocumentPlaceholders(markdown, author),
    [markdown, author]
  )
  const preparedTitle = useMemo(() => {
    const raw = title?.trim() || "Document"
    return applyDocumentPlaceholders(raw, author)
  }, [title, author])

  const exportFormat = async (format: "docx" | "pdf") => {
    setLoading(format)
    setError(null)
    try {
      await exportMarkdownAsDocument({
        title: preparedTitle,
        markdown: preparedMarkdown,
        format,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={cn("mt-3 flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        disabled={loading !== null}
        className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted/60 disabled:opacity-60"
        onClick={() => void exportFormat("docx")}
      >
        {loading === "docx" ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            DOCX…
          </span>
        ) : (
          "Download DOCX"
        )}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted/60 disabled:opacity-60"
        onClick={() => void exportFormat("pdf")}
      >
        {loading === "pdf" ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            PDF…
          </span>
        ) : (
          "Download PDF"
        )}
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
