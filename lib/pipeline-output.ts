/**
 * Classify pipeline task results by deliverable type for viewers (chat + tasks).
 */

import {
  filterUserFacingPartialResults,
  isInternalPipelineArtifactPath,
  stripInternalAgentKeysFromFileMap,
} from "@/lib/pipeline-internal-agents"
import { mergeCodeFilesFromPartialResults } from "@/lib/task-result-parser"

export type PipelineOutputKind =
  | "code"
  | "document"
  | "presentation"
  | "spreadsheet"
  | "analysis"
  | "reasoning"
  | "qna"
  | "image"
  | "mixed"
  | "text"

export interface PipelineArtifact {
  filename: string
  mime_type: string
  base64: string
  label?: string
}

const CODE_EXTS = new Set([
  ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rs", ".cs", ".html", ".htm",
  ".css", ".vue", ".svelte", ".php", ".rb", ".sql", ".sh", ".json", ".yaml", ".yml",
])
const DOC_EXTS = new Set([".pdf", ".doc", ".docx", ".md", ".txt", ".rtf"])
const PPT_EXTS = new Set([".ppt", ".pptx"])
const SHEET_EXTS = new Set([".xls", ".xlsx", ".csv"])
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"])
const MIME_TO_KIND: Record<string, PipelineOutputKind> = {
  "application/pdf": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
  "application/vnd.ms-powerpoint": "presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
}

function ext(path: string): string {
  const m = path.toLowerCase().match(/(\.[a-z0-9]{1,8})$/)
  return m?.[1] ?? ""
}

export function isTemplateDocumentFileMap(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const keys = Object.keys(value as Record<string, unknown>).filter((k) => typeof k === "string")
  if (!keys.length) return false
  const exts = keys.map((k) => ext(k))
  return exts.every((e) => !e || [".md", ".txt", ".json", ".markdown"].includes(e))
}

export function looksLikeCodeFileMap(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  if (isTemplateDocumentFileMap(value)) return false
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return false
  let codeLike = 0
  let total = 0
  for (const [k, v] of entries) {
    if (typeof k !== "string" || typeof v !== "string") continue
    total += 1
    const e = ext(k)
    if (DOC_EXTS.has(e)) continue
    if (CODE_EXTS.has(e) && e !== ".json") codeLike += 1
    else if (e === ".json" && !k.includes("/") && !k.includes("\\")) continue
    else if (k.includes("/") || k.includes("\\")) codeLike += 1
  }
  return total > 0 && codeLike >= Math.max(1, Math.floor(total / 2))
}

function contractKind(masterAnalysis: unknown): PipelineOutputKind | null {
  if (!masterAnalysis || typeof masterAnalysis !== "object") return null
  const contract = (masterAnalysis as Record<string, unknown>).deliverable_contract
  if (!contract || typeof contract !== "object") return null
  const raw = String((contract as Record<string, unknown>).artifact_type || "").toLowerCase()
  const map: Record<string, PipelineOutputKind> = {
    code: "code",
    document: "document",
    analysis: "analysis",
    mixed: "mixed",
    presentation: "presentation",
    ppt: "presentation",
    pptx: "presentation",
    spreadsheet: "spreadsheet",
    excel: "spreadsheet",
    qna: "qna",
    question: "qna",
    image: "image",
    reasoning: "reasoning",
  }
  return map[raw] ?? null
}

function proseKind(text: string, hint: PipelineOutputKind | null): PipelineOutputKind {
  const t = text.trim()
  if (!t) return "text"
  if (hint && hint !== "code" && hint !== "mixed") return hint
  const words = t.split(/\s+/).length
  const lines = t.split("\n").length
  if (words < 120 && lines < 12) return "qna"
  if (lines > 20 || words > 400) return "reasoning"
  return "analysis"
}

const FILE_MAP_METADATA_KEYS = new Set([
  "summary",
  "confidence",
  "components_used",
  "description",
  "requirements",
  "how_to_run",
  "howtorun",
  "features",
  "limitations",
  "possible_extensions",
  "extensions",
])

/** Drop prose/metadata keys so mixed final_result objects classify by deliverable files only. */
function fileMapEntriesForKind(files: Record<string, unknown>): Record<string, string> {
  const stripped = stripInternalAgentKeysFromFileMap(files)
  const out: Record<string, string> = {}
  for (const [key, content] of Object.entries(stripped)) {
    if (FILE_MAP_METADATA_KEYS.has(key.toLowerCase())) continue
    const e = ext(key)
    if (!e && !key.includes("/") && !key.includes("\\")) continue
    out[key] = content
  }
  return out
}

function kindFromFileMap(files: Record<string, string>): PipelineOutputKind | null {
  const deliverables = fileMapEntriesForKind(files as Record<string, unknown>)
  const keys = Object.keys(deliverables)
  if (keys.length === 0) return null
  if (isTemplateDocumentFileMap(deliverables)) return "document"
  const exts = keys.map((k) => ext(k))
  if (exts.some((e) => DOC_EXTS.has(e))) return "document"
  if (exts.some((e) => CODE_EXTS.has(e) && e !== ".json")) return "code"
  if (exts.some((e) => PPT_EXTS.has(e))) return "presentation"
  if (exts.some((e) => SHEET_EXTS.has(e))) return "spreadsheet"
  if (exts.some((e) => IMAGE_EXTS.has(e))) return "image"
  return null
}

/** True when prose is the aggregator/LLM outage placeholder, not real deliverable content. */
export function isLlmUnavailableText(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  return (
    t.includes("[LLM unavailable") ||
    t.includes("All LLM providers failed") ||
    t.includes("[LLM unavailable for this piece")
  )
}

export function classifyPipelineOutput(result: unknown): PipelineOutputKind {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    if (typeof result === "string" && result.trim()) return proseKind(result, null)
    return "text"
  }

  const o = result as Record<string, unknown>
  const frEarly = o.final_result
  if (frEarly && typeof frEarly === "object" && !Array.isArray(frEarly) && looksLikeCodeFileMap(frEarly)) {
    return "code"
  }

  const explicit = o.output_kind
  if (typeof explicit === "string") {
    const k = explicit.trim().toLowerCase() as PipelineOutputKind
    if (
      [
        "code", "document", "presentation", "spreadsheet", "analysis", "reasoning",
        "qna", "image", "mixed", "text",
      ].includes(k)
    ) {
      const proseKinds = new Set<PipelineOutputKind>([
        "document", "analysis", "reasoning", "qna", "text",
      ])
      if (proseKinds.has(k)) return k
      if (k !== "code" && frEarly && typeof frEarly === "object" && !Array.isArray(frEarly) && looksLikeCodeFileMap(frEarly)) {
        return "code"
      }
      return k
    }
  }

  if (o._is_code === true) {
    const fr = o.final_result
    if (fr && typeof fr === "object" && !Array.isArray(fr) && looksLikeCodeFileMap(fr)) {
      return "code"
    }
  }

  let artifacts: unknown = o.artifacts
  if (o.artifact) {
    artifacts = Array.isArray(artifacts) ? [o.artifact, ...artifacts] : [o.artifact]
  }
  if (Array.isArray(artifacts) && artifacts.length > 0) {
    const kinds = new Set<PipelineOutputKind>()
    for (const item of artifacts) {
      if (!item || typeof item !== "object") continue
      const row = item as Record<string, unknown>
      const name = String(row.filename || row.name || "")
      const e = ext(name)
      const mime = String(row.mime_type || row.mime || "").toLowerCase().trim()
      if (IMAGE_EXTS.has(e)) kinds.add("image")
      else if (PPT_EXTS.has(e)) kinds.add("presentation")
      else if (SHEET_EXTS.has(e)) kinds.add("spreadsheet")
      else if (DOC_EXTS.has(e)) kinds.add("document")
      else if (MIME_TO_KIND[mime]) kinds.add(MIME_TO_KIND[mime])
    }
    if (kinds.size > 1) return "mixed"
    if (kinds.size === 1) return [...kinds][0]!
  }

  const fr = o.final_result
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    let frArtifacts: unknown = (fr as Record<string, unknown>).artifacts
    const frArtifact = (fr as Record<string, unknown>).artifact
    if (frArtifact) {
      frArtifacts = Array.isArray(frArtifacts) ? [frArtifact, ...frArtifacts] : [frArtifact]
    }
    if (Array.isArray(frArtifacts) && frArtifacts.length > 0) {
      const kinds = new Set<PipelineOutputKind>()
      for (const item of frArtifacts) {
        if (!item || typeof item !== "object") continue
        const row = item as Record<string, unknown>
        const name = String(row.filename || row.name || "")
        const e = ext(name)
        const mime = String(row.mime_type || row.mime || "").toLowerCase().trim()
        if (IMAGE_EXTS.has(e)) kinds.add("image")
        else if (PPT_EXTS.has(e)) kinds.add("presentation")
        else if (SHEET_EXTS.has(e)) kinds.add("spreadsheet")
        else if (DOC_EXTS.has(e)) kinds.add("document")
        else if (MIME_TO_KIND[mime]) kinds.add(MIME_TO_KIND[mime])
      }
      if (kinds.size > 1) return "mixed"
      if (kinds.size === 1) return [...kinds][0]!
    }
    const frRecord = fr as Record<string, unknown>
    const deliverables = fileMapEntriesForKind(frRecord)
    const summaryText =
      (typeof frRecord.summary === "string" && frRecord.summary.trim()) ||
      (typeof o.summary === "string" && o.summary.trim()) ||
      ""
    if (
      summaryText &&
      Object.keys(deliverables).length > 0 &&
      isTemplateDocumentFileMap(deliverables)
    ) {
      return proseKind(summaryText, contractKind(o.master_analysis))
    }
    const fm = kindFromFileMap(fr as Record<string, string>)
    if (fm) return fm
    if (looksLikeCodeFileMap(fr)) return "code"
  }
  if (typeof fr === "string" && fr.trim()) return proseKind(fr, null)

  for (const key of ["output", "result", "answer", "report", "text"] as const) {
    const val = o[key]
    if (typeof val === "string" && val.trim()) return proseKind(val, null)
  }

  return "text"
}

export function extractPipelineArtifacts(result: unknown): PipelineArtifact[] {
  if (!result || typeof result !== "object" || Array.isArray(result)) return []
  const o = result as Record<string, unknown>
  const out: PipelineArtifact[] = []
  const seen = new Set<string>()

  const pushList = (list: unknown) => {
    if (!Array.isArray(list)) return
    for (const item of list) {
      if (!item || typeof item !== "object") continue
      const row = item as Record<string, unknown>
      const base64 = typeof row.base64 === "string" ? row.base64 : ""
      const mime = typeof row.mime_type === "string" ? row.mime_type : "application/octet-stream"
      const filename =
        typeof row.filename === "string"
          ? row.filename
          : typeof row.name === "string"
            ? row.name
            : ""
      if (!base64 || !filename) continue
      const key = `${filename}|||${mime}|||${base64.slice(0, 32)}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        filename,
        mime_type: mime,
        base64,
        label: typeof row.label === "string" ? row.label : undefined,
      })
    }
  }

  pushList(o.artifacts)
  if (o.artifact) pushList([o.artifact])
  const nested = o.final_result
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const n = nested as Record<string, unknown>
    pushList(n.artifacts)
    if (n.artifact) pushList([n.artifact])
  }
  for (const key of ["result", "output", "approved_result"] as const) {
    const nestedRoot = o[key]
    if (!nestedRoot || typeof nestedRoot !== "object" || Array.isArray(nestedRoot)) continue
    const n = nestedRoot as Record<string, unknown>
    pushList(n.artifacts)
    if (n.artifact) pushList([n.artifact])
  }
  return out
}

function userFacingPartialResults(task: Record<string, unknown>): Record<string, unknown> | undefined {
  const partial = task.partial_results
  if (!partial || typeof partial !== "object" || Array.isArray(partial)) return undefined
  const filtered = filterUserFacingPartialResults(partial as Record<string, unknown>)
  return Object.keys(filtered).length > 0 ? filtered : undefined
}

function hasBinaryArtifactPayload(value: Record<string, unknown>): boolean {
  if (Array.isArray(value.artifacts) && value.artifacts.length > 0) return true
  if (value.artifact && typeof value.artifact === "object") return true
  return false
}

function sanitizeNestedFinalResult(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const record = value as Record<string, unknown>
  if (hasBinaryArtifactPayload(record)) return value
  const nested = record.final_result
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const nestedRecord = nested as Record<string, unknown>
    if (hasBinaryArtifactPayload(nestedRecord)) return value
    const stripped = stripInternalAgentKeysFromFileMap(nestedRecord)
    if (Object.keys(stripped).length > 0) {
      return { ...record, final_result: stripped }
    }
  }
  const allStrings = Object.values(record).every((v) => typeof v === "string")
  if (allStrings) {
    const stripped = stripInternalAgentKeysFromFileMap(record)
    return Object.keys(stripped).length > 0 ? stripped : value
  }
  return value
}

function salvageCodeFromPartialResults(
  task: Record<string, unknown>,
  record: Record<string, unknown>
): Record<string, unknown> {
  const partial = userFacingPartialResults(task)
  if (!partial) {
    return record
  }

  const fr = record.final_result
  if (fr && typeof fr === "object" && !Array.isArray(fr) && looksLikeCodeFileMap(fr)) {
    return record
  }

  const files = mergeCodeFilesFromPartialResults(partial).filter(
    (f) => !isInternalPipelineArtifactPath([f.path, f.name].filter(Boolean).join("/") || f.name)
  )
  if (files.length === 0) return record

  const fileMap: Record<string, string> = {}
  for (const f of files) {
    const rel = [f.path, f.name].filter(Boolean).join("/") || f.name
    if (isInternalPipelineArtifactPath(rel)) continue
    fileMap[rel] = f.content
  }
  if (Object.keys(fileMap).length === 0) return record

  const outputKind = kindFromFileMap(fileMap) ?? "document"

  return {
    ...record,
    _is_code: outputKind === "code",
    final_result: fileMap,
    output_kind: outputKind,
    summary:
      (typeof record.summary === "string" &&
        record.summary.trim() &&
        !isLlmUnavailableText(record.summary)
        ? record.summary.trim()
        : null) ||
      `Recovered ${files.length} file(s) from parallel agent outputs.`,
  }
}

function finalizeViewerPayload(value: unknown): unknown {
  return omitViewerPartialResults(value)
}

export function normalizeTaskResultForViewer(
  task: Record<string, unknown>
): unknown {
  const partialForViewer = userFacingPartialResults(task)
  const taskForViewer =
    partialForViewer !== undefined ? { ...task, partial_results: partialForViewer } : task

  let finalResult = taskForViewer.final_result
  if (finalResult && typeof finalResult === "object" && !Array.isArray(finalResult)) {
    finalResult = sanitizeNestedFinalResult(finalResult)
  }

  const validation = taskForViewer.validation
  const approvedResult =
    validation && typeof validation === "object"
      ? (validation as Record<string, unknown>).approved_result
      : null

  let base: unknown = null
  if (approvedResult !== null && approvedResult !== undefined) {
    base =
      typeof approvedResult === "object" && !Array.isArray(approvedResult)
        ? sanitizeNestedFinalResult(approvedResult)
        : approvedResult
  } else if (typeof finalResult === "string" && finalResult.trim().length > 0) {
    base = finalResult
  } else if (typeof finalResult === "number" || typeof finalResult === "boolean") {
    base = finalResult
  } else if (finalResult && typeof finalResult === "object") {
    base = finalResult
  } else if (partialForViewer) {
    if (looksLikeCodeFileMap(partialForViewer)) {
      base = {
        _is_code: true,
        final_result: stripInternalAgentKeysFromFileMap(partialForViewer),
      }
    } else {
      const salvaged = salvageCodeFromPartialResults(taskForViewer, {
        summary: "Recovered from parallel agent outputs.",
      })
      if (salvaged.final_result) return finalizeViewerPayload(salvaged)
    }
  }

  if (!base || typeof base !== "object" || Array.isArray(base)) {
    if (partialForViewer) {
      const salvaged = salvageCodeFromPartialResults(taskForViewer, {
        summary: "Recovered from parallel agent outputs.",
      })
      const fr = salvaged.final_result
      if (fr && typeof fr === "object" && !Array.isArray(fr)) {
        if (looksLikeCodeFileMap(fr) || kindFromFileMap(fr as Record<string, string>)) {
          return finalizeViewerPayload(salvaged)
        }
      }
    }
    return finalizeViewerPayload(base)
  }

  const kind = classifyPipelineOutput(base)
  const record: Record<string, unknown> = { ...(base as Record<string, unknown>), output_kind: kind }

  if (kind === "code") {
    const fr = record.final_result
    if (fr && typeof fr === "object" && !Array.isArray(fr) && looksLikeCodeFileMap(fr)) {
      record._is_code = true
      return finalizeViewerPayload(record)
    }
    if (record.files_map && looksLikeCodeFileMap(record.files_map)) {
      return finalizeViewerPayload({ ...record, _is_code: true, final_result: record.files_map })
    }
    if (record.files && looksLikeCodeFileMap(record.files)) {
      return finalizeViewerPayload({ ...record, _is_code: true, final_result: record.files })
    }
    if (looksLikeCodeFileMap(record)) {
      return finalizeViewerPayload({ _is_code: true, final_result: record, output_kind: kind })
    }
  }

  if (record._is_code && kind !== "code") {
    const { _is_code: _, ...rest } = record
    return finalizeViewerPayload(salvageCodeFromPartialResults(taskForViewer, rest as Record<string, unknown>))
  }

  const fr = record.final_result
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    const frRecord = fr as Record<string, unknown>
    if (!hasBinaryArtifactPayload(frRecord)) {
      const stripped = stripInternalAgentKeysFromFileMap(frRecord)
      if (Object.keys(stripped).length > 0) {
        record.final_result = stripped
      }
    }
  }

  return finalizeViewerPayload(salvageCodeFromPartialResults(taskForViewer, record))
}

function omitViewerPartialResults(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const { partial_results: _ignored, ...rest } = value as Record<string, unknown>
  return rest
}

export function pipelineOutputKindLabel(kind: PipelineOutputKind): string {
  const labels: Record<PipelineOutputKind, string> = {
    code: "Code",
    document: "Document",
    presentation: "Presentation",
    spreadsheet: "Spreadsheet",
    analysis: "Analysis",
    reasoning: "Reasoning",
    qna: "Q&A",
    image: "Image",
    mixed: "Mixed deliverables",
    text: "Text",
  }
  return labels[kind] ?? "Output"
}
