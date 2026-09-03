import { extractDocumentCardTitle } from "@/lib/document-card-title"
import { isHtmlWriteupFragment } from "@/lib/html-writeup"
import { extractPipelineArtifacts } from "@/lib/pipeline-output"
import {
  combineDeliverableDocumentsForExport,
  deliverableDocumentsFromFiles,
  normalizeMarkdownProse,
} from "@/lib/pipeline-deliverables"
import { extractCodeFromResult } from "@/lib/task-result-parser"
import type { PresentationArtifact } from "@/components/chat/chat-presentation-artifact"

export interface DocumentMessageFields {
  markdown: string
  title?: string
  filename?: string
  artifacts: PresentationArtifact[]
}

function pickMarkdown(record: Record<string, unknown>): string | null {
  const direct = record.document_markdown
  if (typeof direct === "string" && direct.trim().length > 40) {
    return normalizeMarkdownProse(direct)
  }
  const fr = record.final_result
  if (typeof fr === "string" && fr.trim().length > 40) {
    if (isHtmlWriteupFragment(fr)) return null
    return normalizeMarkdownProse(fr)
  }
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    const nested = (fr as Record<string, unknown>).final_result
    if (typeof nested === "string" && nested.trim().length > 40) {
      return normalizeMarkdownProse(nested)
    }
  }
  const fromFiles = pickMarkdownFromFileMap(record)
  if (fromFiles) return fromFiles
  return null
}

function pickMarkdownFromFileMap(record: Record<string, unknown>): string | null {
  const extracted = extractCodeFromResult(record)
  const docs = deliverableDocumentsFromFiles(extracted.files)
  const combined = combineDeliverableDocumentsForExport(docs)
  return combined.length > 40 ? combined : null
}

export function extractDocumentFromTaskResult(result: unknown): DocumentMessageFields | null {
  if (!result || typeof result !== "object") return null
  const record = result as Record<string, unknown>
  const markdown = pickMarkdown(record)
  if (!markdown) return null

  const title =
    typeof record.document_title === "string"
      ? record.document_title
      : extractDocumentCardTitle(markdown, "Research Document")
  const filename =
    typeof record.document_filename === "string"
      ? record.document_filename
      : undefined

  const artifacts = extractPipelineArtifacts(result)
    .filter((a) => /\.(docx|pdf)$/i.test(a.filename))
    .map((a) => ({
      filename: a.filename,
      mime_type: a.mime_type,
      base64: a.base64,
    }))

  return { markdown, title, filename, artifacts }
}

export function resolveDocumentForMessage(
  metadata?: Record<string, unknown>
): DocumentMessageFields | null {
  const fromMeta =
    typeof metadata?.document_markdown === "string"
      ? normalizeMarkdownProse(metadata.document_markdown)
      : null
  if (fromMeta && fromMeta.length > 40) {
    const rawArtifacts = metadata?.document_artifacts
    const artifacts: PresentationArtifact[] = []
    if (Array.isArray(rawArtifacts)) {
      for (const item of rawArtifacts) {
        if (!item || typeof item !== "object") continue
        const row = item as Record<string, unknown>
        const filename = String(row.filename || "").trim()
        const mime_type = String(row.mime_type || "").trim()
        const base64 = String(row.base64 || "").trim()
        if (filename && mime_type && base64) {
          artifacts.push({ filename, mime_type, base64 })
        }
      }
    }
    return {
      markdown: fromMeta,
      title:
        typeof metadata?.document_title === "string"
          ? metadata.document_title
          : undefined,
      filename:
        typeof metadata?.document_filename === "string"
          ? metadata.document_filename
          : undefined,
      artifacts,
    }
  }
  return extractDocumentFromTaskResult(metadata?.task_result)
}
