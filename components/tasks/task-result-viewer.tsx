"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Code,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  Pencil,
  RotateCcw,
  Copy,
} from "lucide-react"
import {
  extractCodeFromResult,
  generateREADME,
  deepParseJsonTree,
  ExtractedCode,
  CodeVariant,
  type CodeFile,
} from "@/lib/task-result-parser"
import { cn } from "@/lib/utils"
import { Callout } from "@/components/ui/callout"
import {
  agentResultMarkdownComponents,
  codeLanguageLabel,
} from "@/components/tasks/agent-partial-result"
import { API_BASE_URL } from "@/lib/routes"
import { getStoredApiKey } from "@/lib/storage"
import { useAppAuth } from "@/hooks/use-app-auth"
import {
  classifyPipelineOutput,
  extractPipelineArtifacts,
  isLlmUnavailableText,
  pipelineOutputKindLabel,
  type PipelineOutputKind,
} from "@/lib/pipeline-output"
import { resolvePipelineViewerMode } from "@/lib/pipeline-deliverables"
import { PipelineDocumentViewer } from "@/components/tasks/pipeline-document-viewer"
import {
  ChatPresentationArtifact,
  extractPresentationFromTaskResult,
  parseSlideOutline,
} from "@/components/chat/chat-presentation-artifact"

function fileStorageKey(f: CodeFile): string {
  const dir = (f.path || "").replace(/^\/+|\/+$/g, "").replace(/\\/g, "/")
  return dir ? `${dir}/${f.name}` : f.name
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

function formatResultData(data: any): string {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

/** Prose / markdown answers (research tasks) where `final_result` is a string, not a file map. */
function extractProseFinalOutput(result: unknown): string | null {
  if (result == null) return null
  if (typeof result === "string") {
    const t = result.trim()
    return t.length > 0 ? t : null
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
  if (typeof fr === "string") {
    const t = pick(fr)
    if (t) return t
  }
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    const frObj = fr as Record<string, unknown>
    const summary = pick(frObj.summary)
    if (summary) return summary
    const inner = frObj.final_result
    if (typeof inner === "string") {
      const t = pick(inner)
      if (t) return t
    }
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const innerSummary = pick((inner as Record<string, unknown>).summary)
      if (innerSummary) return innerSummary
    }
  }
  const rootSummary = pick(o.summary)
  if (rootSummary) return rootSummary
  for (const key of ["output", "result", "answer", "report", "text"] as const) {
    const t = pick(o[key])
    if (t) return t
  }
  return null
}

function stripOuterMarkdownFence(s: string): string {
  const t = s.trim()
  const m = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i)
  if (m?.[1]) return m[1].trim()
  return s
}

/** Turn literal `\n` sequences into newlines when the payload was over-escaped for JSON. */
function normalizeMarkdownProse(s: string): string {
  let t = stripOuterMarkdownFence(s)
  const realNewlines = (t.match(/\n/g) || []).length
  const literalEscNewlines = (t.match(/\\n/g) || []).length
  if (literalEscNewlines >= 2 && literalEscNewlines > realNewlines) {
    t = t.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\\t/g, "\t")
  }
  return t
}

interface TaskResultViewerProps {
  result: any
  taskDescription?: string
  taskId?: string
  /** Lighter layout when embedded under a chat completion message. */
  variant?: "default" | "inline"
}

export function TaskResultViewer({
  result,
  taskDescription,
  taskId,
  variant = "default",
}: TaskResultViewerProps) {
  const { isSuperUser } = useAppAuth()
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [selectedVariant, setSelectedVariant] = useState<CodeVariant | null>(null)
  /** Local-only edits; reset when result / variant changes */
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editingFileKeys, setEditingFileKeys] = useState<Record<string, boolean>>({})
  const [rawDraft, setRawDraft] = useState<string | null>(null)
  const [rawEditing, setRawEditing] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)

  const outputKind = useMemo(
    (): PipelineOutputKind => (result ? classifyPipelineOutput(result) : "text"),
    [result]
  )
  const outputKindLabel = pipelineOutputKindLabel(outputKind)

  const downloadableArtifacts = useMemo(() => extractPipelineArtifacts(result), [result])

  const extracted = useMemo(
    () => (result ? extractCodeFromResult(result) : ({ files: [] } as ExtractedCode)),
    [result]
  )

  const proseOutput = useMemo(() => extractProseFinalOutput(result), [result])
  const proseForMarkdown = useMemo(
    () => (proseOutput ? normalizeMarkdownProse(proseOutput) : null),
    [proseOutput]
  )

  const viewerMode = useMemo(
    () => resolvePipelineViewerMode(outputKind, extracted.files),
    [outputKind, extracted.files]
  )

  const hasDeliverableFiles =
    Boolean(result) &&
    (extracted.files.length > 0 || Boolean(extracted.variants && extracted.variants.length > 0))
  const hasCode = viewerMode === "code" && hasDeliverableFiles
  const showFilesTab = viewerMode === "code" && hasDeliverableFiles
  const filesTabLabel = "Code"

  const taskResultDescription = isSuperUser
    ? "Review, edit, and download task outputs. Code and Raw JSON edits stay local to this browser until you download ZIP or copy."
    : "Review and download task outputs. Any edits in the Code tab stay local to this browser until you download ZIP or copy."

  const fallbackOverview = useMemo(() => {
    if (!result) return null
    const root = typeof result === "object" && result !== null ? (result as Record<string, any>) : {}
    const nested =
      root.final_result && typeof root.final_result === "object"
        ? (root.final_result as Record<string, any>)
        : root
    const files = selectedVariant?.files || extracted.files
    const langSet = new Set(
      files
        .map((f) => (f.language || "").toLowerCase().trim())
        .filter(Boolean)
    )

    const summary =
      (typeof root.summary === "string" && root.summary.trim()) ||
      (typeof nested.summary === "string" && nested.summary.trim()) ||
      ""
    const entrypoint =
      (typeof root.entrypoint === "string" && root.entrypoint.trim()) ||
      (typeof nested.entrypoint === "string" && nested.entrypoint.trim()) ||
      ""
    const confidenceValue =
      typeof root.confidence === "number"
        ? root.confidence
        : typeof nested.confidence === "number"
          ? nested.confidence
          : null
    const confidence = confidenceValue !== null ? `${Math.round(confidenceValue * 100)}%` : null

    const testsReport =
      (root.test_automation && typeof root.test_automation === "object" ? root.test_automation : null) ||
      (nested.test_automation && typeof nested.test_automation === "object" ? nested.test_automation : null)
    const testsPassed =
      testsReport && typeof testsReport.passed === "boolean"
        ? testsReport.passed
          ? "Passed"
          : "Failed"
        : null

    const coherence =
      (root.webapp_static_tests && typeof root.webapp_static_tests === "object"
        ? root.webapp_static_tests
        : null) ||
      (nested.webapp_static_tests && typeof nested.webapp_static_tests === "object"
        ? nested.webapp_static_tests
        : null)
    const coherenceScore =
      coherence && typeof coherence.score === "number" ? `${Math.round(coherence.score * 100)}%` : null

    const details: string[] = []
    if (entrypoint) details.push(`Entrypoint: ${entrypoint}`)
    if (confidence) details.push(`Confidence: ${confidence}`)
    if (testsPassed) details.push(`Automated tests: ${testsPassed}`)
    if (coherenceScore) details.push(`Webapp coherence: ${coherenceScore}`)

    const defaultSummary =
      outputKind === "code"
        ? "Code artifacts generated successfully."
        : outputKind === "qna"
          ? "Answer ready."
          : outputKind === "presentation"
            ? "Presentation content is ready."
            : outputKind === "document"
              ? "Document output is ready."
              : "Pipeline output is ready."

    return {
      summary: summary || defaultSummary,
      fileCount: files.length,
      languages: Array.from(langSet),
      details,
    }
  }, [result, extracted.files, selectedVariant?.files, outputKind])

  useEffect(() => {
    if (!result) {
      setSelectedVariant(null)
      return
    }
    const v = extracted.variants
    if (v && v.length > 0) {
      setSelectedVariant((prev) => (prev && v.some((x) => x.id === prev.id) ? prev : v[0]!))
    } else {
      setSelectedVariant(null)
    }
  }, [extracted.variants, result])

  const displayFiles = useMemo((): CodeFile[] => {
    if (selectedVariant?.files && selectedVariant.files.length > 0) {
      return selectedVariant.files
    }
    return extracted.files
  }, [selectedVariant?.files, extracted.files])

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const f of displayFiles) {
      next[fileStorageKey(f)] = f.content
    }
    setDrafts(next)
    setEditingFileKeys({})
  }, [result, selectedVariant?.id, displayFiles])

  useEffect(() => {
    setRawDraft(null)
    setRawEditing(false)
  }, [result])

  useEffect(() => {
    if (!isSuperUser && activeTab === "raw") {
      setActiveTab("overview")
    }
  }, [isSuperUser, activeTab])

  const filesWithDrafts = useCallback(
    (files: CodeFile[]) =>
      files.map((f) => {
        const k = fileStorageKey(f)
        const body = drafts[k] ?? f.content
        return { ...f, content: body }
      }),
    [drafts]
  )

  const hasFileDraftEdits = useMemo(() => {
    for (const f of displayFiles) {
      const k = fileStorageKey(f)
      const d = drafts[k]
      if (d !== undefined && d !== f.content) return true
    }
    return false
  }, [drafts, displayFiles])

  const formattedRaw = useMemo(() => {
    if (!result) return ""
    return formatResultData(deepParseJsonTree(result, 12))
  }, [result])

  const handleDownload = useCallback(
    async (variant?: CodeVariant) => {
      if (!result) return
      setZipError(null)
      try {
        const useServerZip =
          taskId &&
          !variant &&
          !hasFileDraftEdits &&
          !(rawEditing && rawDraft != null && rawDraft !== formattedRaw)
        if (useServerZip) {
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

        const variantToUse = variant || selectedVariant
        const baseFiles = variantToUse?.files || extracted.files
        const filesToDownload = filesWithDrafts(baseFiles)

        filesToDownload.forEach((file) => {
          const folderPath = file.path || ""
          const filePath = folderPath ? `${folderPath}/${file.name}` : file.name
          zip.file(filePath, file.content)
        })

        const readmeContent = generateREADME(extracted, taskDescription, variantToUse || undefined)
        zip.file("README.md", readmeContent)

        zip.file(
          "docs/result.json",
          rawEditing && rawDraft != null ? rawDraft : formattedRaw
        )

        const blob = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const variantName = variantToUse ? `-${variantToUse.language}` : ""
        a.download = `task-${taskId || "result"}${variantName}-${new Date().toISOString().split("T")[0]}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error creating zip file:", error)
        setZipError("Failed to create zip file. Please try again.")
      }
    },
    [
      result,
      taskId,
      hasFileDraftEdits,
      rawEditing,
      rawDraft,
      formattedRaw,
      filesWithDrafts,
      selectedVariant,
      extracted,
      taskDescription,
    ]
  )

  if (!result) {
    return null
  }

  if (viewerMode === "document") {
    return <PipelineDocumentViewer result={result} taskId={taskId} variant={variant} />
  }

  const presentationFields =
    outputKind === "presentation" ? extractPresentationFromTaskResult(result) : null
  const presentationSlideOutline =
    result && typeof result === "object"
      ? parseSlideOutline(result as Record<string, unknown>)
      : null

  if (outputKind === "presentation" && presentationFields) {
    return (
      <Card variant={variant === "inline" ? "minimal" : "default"} interactive={false}>
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold font-heading leading-snug sm:text-lg">
            Task Result
            <span className="text-xs font-normal rounded-full border border-border/60 bg-muted px-2 py-0.5 text-muted-foreground">
              {outputKindLabel}
            </span>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">{taskResultDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ChatPresentationArtifact
            artifact={presentationFields.artifact}
            title={presentationFields.title}
            themeName={presentationFields.themeName}
            slidesCreated={presentationFields.slidesCreated}
            slideOutline={presentationSlideOutline}
            variant="presented"
          />
          {proseForMarkdown ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 max-h-[min(28rem,60vh)] overflow-auto">
              <div className="agent-md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={agentResultMarkdownComponents}
                >
                  {proseForMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="minimal" interactive={false}>
      <CardHeader className="space-y-1.5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold font-heading leading-snug sm:text-lg">
              Task Result
              <span className="text-xs font-normal rounded-full border border-border/60 bg-muted px-2 py-0.5 text-muted-foreground">
                {outputKindLabel}
              </span>
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">{taskResultDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {showFilesTab && (
              <Button 
                onClick={() => handleDownload(selectedVariant || undefined)} 
                size="sm" 
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ZIP
              </Button>
            )}
            <Button
              onClick={() => setExpanded(!expanded)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {zipError ? (
            <Callout type="error" title="Download failed" className="mb-4">
              <p className="text-sm">{zipError}</p>
            </Callout>
          ) : null}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={cn(
              "grid w-full",
              extracted.variants && extracted.variants.length > 1
                ? (isSuperUser ? "grid-cols-4" : "grid-cols-3")
                : (isSuperUser ? "grid-cols-3" : "grid-cols-2")
            )}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {showFilesTab && <TabsTrigger value="code">{filesTabLabel}</TabsTrigger>}
              {extracted.variants && extracted.variants.length > 1 && (
                <TabsTrigger value="variants">Variants</TabsTrigger>
              )}
              {isSuperUser && <TabsTrigger value="raw">Raw JSON</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                {downloadableArtifacts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Downloads</h3>
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
                  </div>
                )}

                {extracted.description && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{extracted.description}</p>
                  </div>
                )}

                {extracted.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Requirements</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{extracted.requirements}</p>
                  </div>
                )}

                {extracted.howToRun && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">How to Run</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{extracted.howToRun}</p>
                  </div>
                )}

                {extracted.features && extracted.features.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {extracted.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.limitations && extracted.limitations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Limitations</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {extracted.limitations.map((limitation, idx) => (
                        <li key={idx}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {extracted.extensions && extracted.extensions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Possible Extensions</h3>
                    <div className="space-y-3">
                      {extracted.extensions.map((ext, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <h4 className="text-sm font-medium mb-1">{ext.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{ext.description}</p>
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            Difficulty: {ext.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!extracted.description && !extracted.requirements && !extracted.howToRun && (
                  <>
                    {proseOutput && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Generated output</h3>
                        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 max-h-[min(36rem,70vh)] overflow-auto">
                          <div className="agent-md">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={agentResultMarkdownComponents}
                            >
                              {proseForMarkdown ?? proseOutput}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    {showFilesTab && fallbackOverview ? (
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Generated Output Overview</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {fallbackOverview.summary}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Files generated: {fallbackOverview.fileCount}</p>
                          {fallbackOverview.languages.length > 0 && (
                            <p>Languages: {fallbackOverview.languages.join(", ")}</p>
                          )}
                          {fallbackOverview.details.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {!proseOutput && !(showFilesTab && fallbackOverview) && (
                      <p className="text-sm text-muted-foreground">No structured information available.</p>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {showFilesTab && (
              <TabsContent value="code" className="mt-4">
                <div className="space-y-4">
                  {selectedVariant && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Selected Variant: {selectedVariant.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedVariant.language}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(selectedVariant)}
                          variant="default"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download This Variant
                        </Button>
                      </div>
                    </div>
                  )}
                  {displayFiles.map((file, idx) => {
                    const k = fileStorageKey(file)
                    const text = drafts[k] ?? file.content
                    const isEditing = Boolean(editingFileKeys[k])
                    return (
                      <div key={`${k}-${idx}`} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Code className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {file.path ? `${file.path}/` : ""}
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              ({codeLanguageLabel(file.language)})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={async () => {
                                const ok = await copyToClipboard(text)
                                if (ok) {
                                  /* optional toast */
                                }
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() =>
                                setEditingFileKeys((prev) => ({ ...prev, [k]: !prev[k] }))
                              }
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              {isEditing ? "Done" : "Edit"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() =>
                                setDrafts((prev) => ({ ...prev, [k]: file.content }))
                              }
                              title="Revert this file to generated content"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const blob = new Blob([text], { type: "text/plain" })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = file.name
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }}
                              className="h-7 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-[min(32rem,75vh)] min-h-0 overflow-auto bg-background p-4">
                          {isEditing ? (
                            <textarea
                              value={text}
                              onChange={(e) =>
                                setDrafts((prev) => ({ ...prev, [k]: e.target.value }))
                              }
                              className="w-full min-h-[16rem] font-mono text-xs leading-normal [tab-size:2] rounded-md border border-border bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              spellCheck={false}
                              aria-label={`Edit ${k}`}
                            />
                          ) : file.language === "markdown" ? (
                            <div className="agent-md text-sm leading-relaxed">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={agentResultMarkdownComponents}
                              >
                                {normalizeMarkdownProse(text)}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <pre className="whitespace-pre font-mono text-xs leading-normal [tab-size:2]">
                              <code>{text}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            )}

            {extracted.variants && extracted.variants.length > 1 && (
              <TabsContent value="variants" className="mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a code variant to view and download. Each variant represents a different implementation approach.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {extracted.variants.map((variant) => (
                      <Card
                        key={variant.id}
                        variant="minimal"
                        interactive
                        className={cn(
                          "cursor-pointer border-2 transition-colors",
                          selectedVariant?.id === variant.id
                            ? "border-primary"
                            : "border-transparent hover:border-primary/60"
                        )}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{variant.name}</CardTitle>
                            {selectedVariant?.id === variant.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <CardDescription>{variant.language}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {variant.description && (
                            <p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
                          )}
                          {variant.files.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium mb-1">Files:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {variant.files.map((file, idx) => (
                                  <li key={idx} className="font-mono">
                                    {file.path ? `${file.path}/` : ""}{file.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVariant(variant)
                              setActiveTab("code")
                            }}
                          >
                            {selectedVariant?.id === variant.id ? "Viewing" : "View & Download"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            {isSuperUser && (
            <TabsContent value="raw" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Raw JSON Result</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={async () => {
                        const body = rawEditing && rawDraft != null ? rawDraft : formattedRaw
                        await copyToClipboard(body)
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (rawEditing) {
                          setRawEditing(false)
                          setRawDraft(null)
                        } else {
                          setRawDraft(formattedRaw)
                          setRawEditing(true)
                        }
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      {rawEditing ? "Stop editing" : "Edit locally"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setRawDraft(formattedRaw)
                      }}
                      disabled={!rawEditing}
                      title="Discard raw JSON edits"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="max-h-[min(36rem,78vh)] min-h-0 overflow-auto bg-background p-4">
                  {rawEditing ? (
                    <textarea
                      value={rawDraft ?? formattedRaw}
                      onChange={(e) => setRawDraft(e.target.value)}
                      className="w-full min-h-[20rem] font-mono text-xs leading-normal [tab-size:2] rounded-md border border-border bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      spellCheck={false}
                      aria-label="Edit raw JSON"
                    />
                  ) : (
                    <pre className="whitespace-pre font-mono text-xs leading-normal [tab-size:2]">
                      <code>{formattedRaw}</code>
                    </pre>
                  )}
                </div>
              </div>
            </TabsContent>
            )}
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
