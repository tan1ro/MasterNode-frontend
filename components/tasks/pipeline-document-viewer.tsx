"use client"

import { useCallback, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { pipelineDocumentMarkdownComponents } from "@/components/markdown/markdown-components"
import { extractCodeFromResult } from "@/lib/task-result-parser"
import {
  classifyPipelineOutput,
  extractPipelineArtifacts,
  isLlmUnavailableText,
  pipelineOutputKindLabel,
} from "@/lib/pipeline-output"
import {
  combineDeliverableDocumentsForExport,
  deliverableDocumentsFromFiles,
  normalizeMarkdownProse,
  type DeliverableDocument,
} from "@/lib/pipeline-deliverables"
import { extractDocumentCardTitle } from "@/lib/document-card-title"
import { ChatDocumentActions } from "@/components/chat/chat-document-actions"
import { ChatHtmlWriteupArtifact } from "@/components/chat/chat-html-writeup-artifact"
import { extractHtmlWriteupFromTaskResult } from "@/lib/html-writeup"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/routes"
import { getStoredApiKey } from "@/lib/storage"
import { useAppAuth } from "@/hooks/use-app-auth"
import {
  applyDocumentPlaceholders,
  resolveAuthorFromUser,
} from "@/lib/document-placeholders"

function extractSummary(result: unknown): string | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null
  const o = result as Record<string, unknown>
  const nested =
    o.final_result && typeof o.final_result === "object" && !Array.isArray(o.final_result)
      ? (o.final_result as Record<string, unknown>)
      : null
  const raw =
    (typeof o.summary === "string" && o.summary.trim()) ||
    (nested && typeof nested.summary === "string" && nested.summary.trim()) ||
    ""
  if (!raw || isLlmUnavailableText(raw)) return null
  return raw
}

function extractProseOnly(result: unknown): string | null {
  if (result == null) return null
  if (typeof result === "string") {
    const t = result.trim()
    return t && !isLlmUnavailableText(t) ? t : null
  }
  if (typeof result !== "object" || Array.isArray(result)) return null
  const o = result as Record<string, unknown>
  const pick = (v: unknown): string | null => {
    if (typeof v !== "string") return null
    const t = v.trim()
    if (!t || isLlmUnavailableText(t)) return null
    return t
  }
  const fr = o.final_result
  if (typeof fr === "string") return pick(fr)
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    const inner = (fr as Record<string, unknown>).final_result
    if (typeof inner === "string") return pick(inner)
  }
  for (const key of ["output", "result", "answer", "report", "text"] as const) {
    const t = pick(o[key])
    if (t) return t
  }
  return null
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.left = "-9999px"
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
  }
}

interface PipelineDocumentViewerProps {
  result: unknown
  taskId?: string
  /** Chat embeds use lighter chrome; task page uses the full card. */
  variant?: "default" | "inline"
}

export function PipelineDocumentViewer({
  result,
  taskId,
  variant = "default",
}: PipelineDocumentViewerProps) {
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const { user } = useAppAuth()
  const author = useMemo(() => resolveAuthorFromUser(user), [user])

  const outputKind = useMemo(
    () => (result ? classifyPipelineOutput(result) : "text"),
    [result]
  )
  const outputKindLabel = pipelineOutputKindLabel(outputKind)
  const summary = useMemo(() => extractSummary(result), [result])
  const proseOnly = useMemo(() => extractProseOnly(result), [result])
  const proseMarkdown = useMemo(() => {
    if (!proseOnly) return null
    return applyDocumentPlaceholders(normalizeMarkdownProse(proseOnly), author)
  }, [proseOnly, author])

  const extracted = useMemo(
    () => (result ? extractCodeFromResult(result) : { files: [] }),
    [result]
  )

  const documents = useMemo(
    () => deliverableDocumentsFromFiles(extracted.files),
    [extracted.files]
  )

  const activeDoc = useMemo((): DeliverableDocument | null => {
    if (documents.length === 0) return null
    if (activeDocId) {
      return documents.find((d) => d.id === activeDocId) ?? documents[0]!
    }
    return documents[0]!
  }, [documents, activeDocId])

  const downloadableArtifacts = useMemo(() => extractPipelineArtifacts(result), [result])

  const htmlWriteup = useMemo(() => extractHtmlWriteupFromTaskResult(result), [result])

  const exportMarkdown = useMemo(() => {
    if (documents.length > 0) {
      return combineDeliverableDocumentsForExport(documents)
    }
    return proseMarkdown
  }, [documents, proseMarkdown])

  const exportTitle = useMemo(() => {
    if (result && typeof result === "object" && !Array.isArray(result)) {
      const title = (result as Record<string, unknown>).document_title
      if (typeof title === "string" && title.trim()) return title.trim()
    }
    if (activeDoc && documents.length === 1) return activeDoc.title
    if (exportMarkdown) {
      return extractDocumentCardTitle(exportMarkdown, "Research Document")
    }
    return "Research Document"
  }, [activeDoc, documents.length, exportMarkdown, result])

  const handleDownloadZip = useCallback(async () => {
    if (documents.length === 0) return
    try {
      if (taskId) {
        const apiKey = getStoredApiKey()
        const u = new URL(`${API_BASE_URL}/v1/task/${taskId}/result/zip`)
        const resp = await fetch(u.toString(), {
          method: "GET",
          headers: apiKey ? { "X-API-Key": apiKey } : {},
        })
        if (resp.ok) {
          const blob = await resp.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `task-${taskId}-${new Date().toISOString().split("T")[0]}.zip`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return
        }
      }
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      for (const doc of documents) {
        zip.file(doc.relativePath, doc.content)
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `documents-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Non-blocking
    }
  }, [documents, taskId])

  const handleDownloadDoc = useCallback((doc: DeliverableDocument) => {
    const blob = new Blob([doc.content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = doc.relativePath.split("/").pop() || "document.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  if (htmlWriteup) {
    const inlineBody = (
      <ChatHtmlWriteupArtifact
        html={htmlWriteup.html}
        title={htmlWriteup.title}
        filename={htmlWriteup.filename}
        className="mt-0"
      />
    )
    if (variant === "inline") {
      return (
        <div className="space-y-2.5">
          {summary ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{summary}</p>
          ) : null}
          {inlineBody}
        </div>
      )
    }
    return (
      <Card variant="minimal" interactive={false}>
        <CardHeader className="space-y-1.5 pb-3">
          <CardTitle className="text-base font-semibold font-heading sm:text-lg">
            {htmlWriteup.title || "Project write-up"}
          </CardTitle>
          {summary ? <CardDescription className="text-sm">{summary}</CardDescription> : null}
        </CardHeader>
        <CardContent className="pt-0">{inlineBody}</CardContent>
      </Card>
    )
  }

  const readerClass =
    variant === "inline"
      ? "agent-md px-0.5 py-0.5 text-[13px]"
      : "agent-md max-h-[min(42rem,72vh)] overflow-auto px-1 py-0.5"

  const readerBody = activeDoc ? (
    <div className={readerClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={pipelineDocumentMarkdownComponents}>
        {normalizeMarkdownProse(activeDoc.content)}
      </ReactMarkdown>
    </div>
  ) : proseMarkdown ? (
    <div className={readerClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={pipelineDocumentMarkdownComponents}>
        {proseMarkdown}
      </ReactMarkdown>
    </div>
  ) : (
    <p className="text-xs text-muted-foreground">No readable content was produced for this run.</p>
  )

  const docPicker =
    documents.length > 1 ? (
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Document sections"
      >
        {documents.map((doc) => {
          const selected = activeDoc?.id === doc.id
          return (
            <button
              key={doc.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveDocId(doc.id)}
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                selected
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <FileText className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{doc.title}</span>
            </button>
          )
        })}
      </div>
    ) : null

  const actionRow = (
    <div className="flex flex-wrap items-center gap-2">
      {activeDoc ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => void copyToClipboard(activeDoc.content)}
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => handleDownloadDoc(activeDoc)}
          >
            <Download className="mr-1 h-3 w-3" />
            Download
          </Button>
        </>
      ) : null}
      {documents.length > 0 ? (
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={handleDownloadZip}>
          <Download className="mr-1 h-3 w-3" />
          {documents.length > 1 ? "Download all" : "Download ZIP"}
        </Button>
      ) : null}
      {exportMarkdown ? (
        <ChatDocumentActions markdown={exportMarkdown} title={exportTitle} className="contents" />
      ) : null}
    </div>
  )

  const artifactLinks =
    downloadableArtifacts.length > 0 ? (
      <ul className="space-y-2">
        {downloadableArtifacts.map((artifact) => (
          <li key={artifact.filename}>
            <a
              href={`data:${artifact.mime_type};base64,${artifact.base64}`}
              download={artifact.filename}
              className="inline-flex items-center gap-2 text-sm text-primary underline-offset-2 hover:underline"
            >
              <FileText className="h-4 w-4 shrink-0" />
              {artifact.label || artifact.filename}
            </a>
          </li>
        ))}
      </ul>
    ) : null

  if (variant === "inline") {
    return (
      <div className="space-y-2.5">
        {summary ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{summary}</p>
        ) : null}
        {docPicker}
        {documents.length > 0 || proseMarkdown ? (
          <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5">
            {documents.length === 1 && activeDoc ? (
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{activeDoc.title}</p>
            ) : null}
            {readerBody}
          </div>
        ) : null}
        {actionRow}
        {artifactLinks}
      </div>
    )
  }

  return (
    <Card variant="minimal" interactive={false}>
      <CardHeader className="space-y-1.5 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold font-heading sm:text-lg">
              Research output
              <span className="text-xs font-normal rounded-full border border-border/60 bg-muted px-2 py-0.5 text-muted-foreground">
                {outputKindLabel}
              </span>
            </CardTitle>
            {summary ? (
              <CardDescription className="text-sm leading-relaxed">{summary}</CardDescription>
            ) : (
              <CardDescription className="text-sm leading-relaxed">
                Read, copy, or download the generated documents from this pipeline run.
              </CardDescription>
            )}
          </div>
          {actionRow}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {docPicker}
        <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
          {documents.length === 1 && activeDoc ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {activeDoc.title}
            </p>
          ) : null}
          {readerBody}
        </div>
        {artifactLinks ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Attachments</h3>
            {artifactLinks}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
