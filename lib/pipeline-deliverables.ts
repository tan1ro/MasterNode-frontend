/**
 * Helpers for splitting code deliverables (file browser) from document/research deliverables (reader UI).
 */

import { isInternalPipelineArtifactPath } from "@/lib/pipeline-internal-agents"
import type { PipelineOutputKind } from "@/lib/pipeline-output"
import type { CodeFile } from "@/lib/task-result-parser"

const DOC_LANGUAGES = new Set(["markdown", "text", "plaintext"])

export function pipelineOutputUsesCodeFileBrowser(kind: PipelineOutputKind): boolean {
  return kind === "code"
}

export function pipelineOutputUsesDocumentReader(kind: PipelineOutputKind): boolean {
  return (
    kind === "document" ||
    kind === "analysis" ||
    kind === "reasoning" ||
    kind === "qna" ||
    kind === "text"
  )
}

export function isDocumentFileLanguage(language: string): boolean {
  return DOC_LANGUAGES.has((language || "").toLowerCase().trim())
}

export function isDocumentFilename(name: string): boolean {
  return /\.(md|markdown|txt)$/i.test(name || "")
}

export function deliverableRelativePath(file: CodeFile): string {
  const dir = (file.path || "").replace(/^\/+|\/+$/g, "").replace(/\\/g, "/")
  const isDoc = isDocumentFileLanguage(file.language) || isDocumentFilename(file.name)
  const cleanDir = dir === "src" && isDoc ? "" : dir
  return cleanDir ? `${cleanDir}/${file.name}` : file.name
}

export function humanizeDocumentTitle(relativePath: string): string {
  const base = relativePath.split("/").pop() || relativePath
  const withoutExt = base.replace(/\.(md|txt|markdown)$/i, "")
  return withoutExt
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export interface DeliverableDocument {
  id: string
  title: string
  relativePath: string
  content: string
  language: string
}

export function deliverableDocumentsFromFiles(files: CodeFile[]): DeliverableDocument[] {
  return files
    .filter((f) => isDocumentFileLanguage(f.language) || isDocumentFilename(f.name))
    .filter((f) => !isInternalPipelineArtifactPath(deliverableRelativePath(f)))
    .map((f) => {
      const relativePath = deliverableRelativePath(f)
      return {
        id: relativePath,
        title: humanizeDocumentTitle(relativePath),
        relativePath,
        content: f.content,
        language: f.language,
      }
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export function stripOuterMarkdownFence(s: string): string {
  const t = s.trim()
  const m = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i)
  if (m?.[1]) return m[1].trim()
  return s
}

/** Turn literal `\n` sequences into newlines when the payload was over-escaped for JSON. */
export function normalizeMarkdownProse(s: string): string {
  let t = stripOuterMarkdownFence(s)
  const realNewlines = (t.match(/\n/g) || []).length
  const literalEscNewlines = (t.match(/\\n/g) || []).length
  if (literalEscNewlines >= 2 && literalEscNewlines > realNewlines) {
    t = t.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\\t/g, "\t")
  }
  return t
}

/** Merge multi-section markdown deliverables into one exportable document. */
export function combineDeliverableDocumentsForExport(docs: DeliverableDocument[]): string {
  if (docs.length === 0) return ""
  if (docs.length === 1) return normalizeMarkdownProse(docs[0]!.content)
  return docs
    .map((d) => `# ${d.title}\n\n${normalizeMarkdownProse(d.content)}`)
    .join("\n\n---\n\n")
}

export function resolvePipelineViewerMode(
  outputKind: PipelineOutputKind,
  files: CodeFile[]
): "code" | "document" | "artifacts" {
  if (outputKind === "code") return "code"
  if (
    outputKind === "presentation" ||
    outputKind === "spreadsheet" ||
    outputKind === "image"
  ) {
    return "artifacts"
  }
  if (outputKind === "mixed") {
    const docFiles = deliverableDocumentsFromFiles(files)
    const codeFiles = files.filter(
      (f) => !isDocumentFileLanguage(f.language) && !isDocumentFilename(f.name)
    )
    if (codeFiles.length > 0 && docFiles.length === 0) return "code"
    if (docFiles.length > 0) return "document"
    return "artifacts"
  }
  if (pipelineOutputUsesDocumentReader(outputKind)) return "document"
  return "artifacts"
}
