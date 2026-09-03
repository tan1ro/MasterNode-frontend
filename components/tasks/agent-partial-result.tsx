"use client"

import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { markdownComponents as _importedMarkdownComponents } from "@/components/markdown/markdown-components"
import { Sparkles, AlertCircle, FileCode2 } from "lucide-react"
import { Callout } from "@/components/ui/callout"
import { AccordionGroup, AccordionItem } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { CodeFile } from "@/lib/task-result-parser"
import {
  deepParseJsonTree,
  extractStructuredCodeFiles,
  extractUnifiedFilesFromAgentResultText,
  mergeLooseFileMapRecordsFromText,
  segmentLooseAgentOutput,
} from "@/lib/task-result-parser"

import { humanizeAgentId } from "@/lib/parallel-agent-labels"

export { humanizeAgentId }

function formatConfidenceLabel(c: number): string {
  if (!Number.isFinite(c)) return ""
  const pct = c <= 1 ? c * 100 : c
  const rounded = pct >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10
  return `${rounded}% confidence`
}

type ResearchShape = {
  result?: unknown
  error?: string
  confidence?: number
  metadata?: unknown
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function looksLikeResearchPayload(v: unknown): v is ResearchShape {
  if (!isPlainObject(v)) return false
  return (
    "result" in v ||
    "error" in v ||
    "confidence" in v ||
    "metadata" in v
  )
}

export { markdownComponents as agentResultMarkdownComponents } from "@/components/markdown/markdown-components"

const mdComponents = _importedMarkdownComponents

function stringifyPretty(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

/** Drop repeated inline file-map dicts from metadata so Technical details is not a wall of duplicates. */
function scrubMetadataForDisplay(metadata: unknown): unknown {
  if (typeof metadata !== "string") return deepParseJsonTree(metadata, 10)
  const { mergedRecord, cleanedText } = mergeLooseFileMapRecordsFromText(metadata)
  if (Object.keys(mergedRecord).length === 0) return metadata
  const trimmed = cleanedText.trim()
  if (!trimmed) {
    return "Inline file-map payloads were omitted here (same paths appear under extracted files above)."
  }
  return `${trimmed}\n\n— Inline file-map dicts removed from this technical log to avoid duplication.`
}

/** Long strings that are clearly data/code/HTML, not Markdown prose. */
function isStructuredOrCodeString(s: string): boolean {
  const t = s.trim()
  if (t.length < 64) return false
  if (/^[\[{]/.test(t)) return true
  if (/^<!DOCTYPE\b/i.test(t) || /^<\s*html[\s>]/i.test(t)) return true
  if ((t.match(/\n/g)?.length ?? 0) >= 4) return true
  if (t.length > 400 && t.includes("{") && t.includes("}")) return true
  return false
}

function tryParseJsonObject(s: string): Record<string, unknown> | unknown[] | null {
  const t = s.trim()
  if (!t.startsWith("{") && !t.startsWith("[")) return null
  try {
    const v = JSON.parse(t) as unknown
    if (typeof v === "object" && v !== null) return v as Record<string, unknown> | unknown[]
  } catch {
    /* Python repr / concatenated blobs — show as raw text */
  }
  return null
}

export function codeLanguageLabel(lang: string): string {
  const id = lang.toLowerCase()
  const map: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    csharp: "C#",
    cpp: "C++",
    shell: "Shell",
    markdown: "Markdown",
    yaml: "YAML",
    text: "Plain text",
  }
  return map[id] ?? lang.charAt(0).toUpperCase() + id.slice(1)
}

export function ExtractedFilesList({ files }: { files: CodeFile[] }) {
  if (files.length === 0) return null
  return (
    <div className="space-y-3" aria-label="Extracted files from agent output">
      <p className="text-xs font-medium text-muted-foreground">
        {files.length} file{files.length === 1 ? "" : "s"} in this bundle
      </p>
      {files.map((f, idx) => {
        const rel = f.path ? `${f.path}/${f.name}` : f.name
        return (
          <div
            key={`${rel}-${idx}`}
            className="overflow-hidden rounded-lg border border-border/60 bg-background/80 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/45 px-3 py-2">
              <FileCode2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 truncate font-mono text-xs font-medium text-foreground">{rel}</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                {codeLanguageLabel(f.language)}
              </span>
            </div>
            <pre className={fileBodyPreClass} tabIndex={0}>
              <code className="font-mono text-inherit">{f.content}</code>
            </pre>
          </div>
        )
      })}
    </div>
  )
}

const codePreClass =
  "max-h-[min(32rem,75vh)] min-h-0 overflow-auto overflow-x-auto rounded-lg border border-border/50 bg-muted/25 p-4 font-mono text-xs leading-normal text-foreground/90 whitespace-pre [tab-size:2]"

const fileBodyPreClass =
  "max-h-[min(32rem,75vh)] min-h-0 w-full overflow-auto overflow-x-auto p-3 font-mono text-[11px] leading-normal text-foreground/90 whitespace-pre [tab-size:2]"

const jsonPreClass =
  "max-h-[min(32rem,75vh)] min-h-0 overflow-auto overflow-x-auto font-mono text-xs leading-normal text-muted-foreground whitespace-pre [tab-size:2]"

function JsonPayloadAccordion({ data }: { data: unknown }) {
  return (
    <AccordionGroup>
      <AccordionItem title="Full payload (JSON)" defaultOpen={false}>
        <pre className={jsonPreClass}>{stringifyPretty(data)}</pre>
      </AccordionItem>
    </AccordionGroup>
  )
}

function renderObjectOrData(value: unknown, options?: { omitFilePanels?: boolean }): ReactNode {
  const omitFilePanels = Boolean(options?.omitFilePanels)
  if (value === null || value === undefined) {
    return <p className="text-sm text-muted-foreground">No content.</p>
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return <p className="text-sm text-muted-foreground">No content.</p>

    const unified = extractUnifiedFilesFromAgentResultText(trimmed)
    if (unified.files.length > 0) {
      const prose = unified.prose.trim()
      return (
        <div className="space-y-4">
          {prose ? (
            <div className="agent-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {prose}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Structured project files were extracted from this output.</p>
          )}
          {omitFilePanels ? (
            <p className="text-xs text-muted-foreground">
              This agent&apos;s files are included in the combined project section above.
            </p>
          ) : (
            <ExtractedFilesList files={unified.files} />
          )}
        </div>
      )
    }

    const looseSegments = segmentLooseAgentOutput(trimmed)
    if (looseSegments && looseSegments.length > 0) {
      const hasFileMapSegs = looseSegments.some((s) => s.kind === "fileMap")
      return (
        <div className="space-y-4">
          {omitFilePanels && hasFileMapSegs && (
            <p className="text-xs text-muted-foreground">
              This agent&apos;s files are included in the combined project section above.
            </p>
          )}
          {looseSegments.map((seg, idx) => {
            if (seg.kind === "fileMap") {
              if (omitFilePanels) return null
              return <ExtractedFilesList key={`fm-${idx}`} files={seg.files} />
            }
            if (seg.preferCode) {
              return (
                <pre key={`tx-${idx}`} className={codePreClass}>
                  {seg.text}
                </pre>
              )
            }
            return (
              <div key={`tx-${idx}`} className="agent-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {seg.text}
                </ReactMarkdown>
              </div>
            )
          })}
        </div>
      )
    }

    const parsed = tryParseJsonObject(trimmed)
    if (parsed !== null) {
      const normalized = deepParseJsonTree(parsed, 14)
      const structured = extractStructuredCodeFiles(normalized)
      if (structured.length > 0) {
        return (
          <div className="space-y-4">
            {omitFilePanels ? (
              <p className="text-xs text-muted-foreground">
                This agent&apos;s files are included in the combined project section above.
              </p>
            ) : (
              <ExtractedFilesList files={structured} />
            )}
            <JsonPayloadAccordion data={normalized} />
          </div>
        )
      }
      return (
        <div className="space-y-4">
          <pre className={codePreClass}>{stringifyPretty(normalized)}</pre>
        </div>
      )
    }

    if (isStructuredOrCodeString(trimmed)) {
      return <pre className={codePreClass}>{trimmed}</pre>
    }

    return (
      <div className="agent-md">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {trimmed}
        </ReactMarkdown>
      </div>
    )
  }

  if (typeof value === "object") {
    const normalized = deepParseJsonTree(value, 14)
    const structured = extractStructuredCodeFiles(normalized)
    if (structured.length > 0) {
      return (
        <div className="space-y-4">
          {omitFilePanels ? (
            <p className="text-xs text-muted-foreground">
              This agent&apos;s files are included in the combined project section above.
            </p>
          ) : (
            <ExtractedFilesList files={structured} />
          )}
          <JsonPayloadAccordion data={normalized} />
        </div>
      )
    }
    return <pre className={codePreClass}>{stringifyPretty(normalized)}</pre>
  }

  return <p className="text-[15px] leading-relaxed text-foreground/90">{String(value)}</p>
}

function renderResultBody(value: unknown, omitFilePanels?: boolean): ReactNode {
  return renderObjectOrData(value, { omitFilePanels })
}

export interface AgentPartialResultProps {
  agentId: string
  value: unknown
  /** When the parent shows a merged file tree for all agents, hide per-agent duplicate file panels */
  omitFilePanels?: boolean
  /** Omit the card header (e.g. parent already shows the agent title in an accordion) */
  suppressHeader?: boolean
}

export function AgentPartialResult({ agentId, value, omitFilePanels, suppressHeader }: AgentPartialResultProps) {
  const label = humanizeAgentId(agentId)

  let parsed: unknown = value
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value)
    } catch {
      parsed = value
    }
  }

  if (looksLikeResearchPayload(parsed)) {
    const { result, error, confidence, metadata } = parsed
    const errText = typeof error === "string" ? error.trim() : ""
    const hasErr = Boolean(errText)
    const conf =
      typeof confidence === "number" && Number.isFinite(confidence) ? confidence : null

    return (
      <article
        className={cn(
          "rounded-xl border border-border/60 bg-card/80 shadow-sm",
          "ring-1 ring-black/[0.03] dark:ring-white/[0.04]",
          suppressHeader && "border-0 shadow-none ring-0 bg-transparent"
        )}
      >
        {!suppressHeader && (
          <header className="flex flex-wrap items-start gap-3 border-b border-border/50 bg-muted/20 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/12 text-emerald">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">{label}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Completed agent output</p>
            </div>
            {conf !== null && (
              <span
                className="inline-flex items-center rounded-full border border-emerald/25 bg-emerald/10 px-2.5 py-1 text-xs font-medium text-emerald"
                title="Estimated reliability of this section"
              >
                {formatConfidenceLabel(conf)}
              </span>
            )}
          </header>
        )}

        <div className={cn("space-y-4", suppressHeader ? "px-0 py-0" : "px-5 py-5")}>
          {hasErr && (
            <Callout type="error" title="This section could not be generated">
              <p>{errText}</p>
            </Callout>
          )}

          {result !== undefined &&
            result !== null &&
            !(typeof result === "string" && !String(result).trim()) && (
              <div className="max-w-none min-w-0">{renderResultBody(result, omitFilePanels)}</div>
            )}

          {!hasErr &&
            (result === undefined ||
              result === null ||
              (typeof result === "string" && !String(result).trim())) && (
              <p className="text-sm text-muted-foreground">No written result for this agent.</p>
            )}

          {metadata !== undefined && metadata !== null && !omitFilePanels && (
            <AccordionGroup>
              <AccordionItem title="Technical details" defaultOpen={false}>
                <pre className={jsonPreClass}>{stringifyPretty(scrubMetadataForDisplay(metadata))}</pre>
              </AccordionItem>
            </AccordionGroup>
          )}
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-border/60 bg-card/80 shadow-sm",
        "ring-1 ring-black/[0.03] dark:ring-white/[0.04]",
        suppressHeader && "border-0 shadow-none ring-0 bg-transparent"
      )}
    >
      {!suppressHeader && (
        <header className="flex items-start gap-3 border-b border-border/50 bg-muted/20 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <AlertCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">{label}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Agent output</p>
          </div>
        </header>
      )}
      <div className={cn("min-w-0", suppressHeader ? "px-0 py-0" : "px-5 py-5")}>
        <div className="max-w-none min-w-0">{renderObjectOrData(parsed, { omitFilePanels })}</div>
      </div>
    </article>
  )
}
