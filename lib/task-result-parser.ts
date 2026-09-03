/**
 * Utility functions for parsing and extracting information from task results
 */

import { isInternalPipelineAgentId } from "@/lib/pipeline-internal-agents"

export interface CodeFile {
  name: string
  content: string
  language: string
  path?: string // For folder structure
}

export interface CodeVariant {
  id: string
  name: string
  language: string
  files: CodeFile[]
  description?: string
  requirements?: string
  howToRun?: string
  features?: string[]
}

export interface ExtractedCode {
  files: CodeFile[]
  variants?: CodeVariant[]
  description?: string
  requirements?: string
  howToRun?: string
  features?: string[]
  limitations?: string[]
  extensions?: Array<{
    name: string
    description: string
    difficulty: string
  }>
  metadata?: Record<string, any>
}

function sanitizeMarkdownSectionBody(body: string): string {
  return body.trim().replace(/\n{3,}/g, "\n\n")
}

function parseTutorialMarkdownOutput(markdown: string): Partial<ExtractedCode> {
  const files: CodeFile[] = []
  const byName = new Set<string>()

  const sectionCodeRegex =
    /###\s*\d+\.\s*The[^\n]*\((?:`)?([^`)\n]+)(?:`)?\)[\s\S]*?```([\w+-]*)\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = sectionCodeRegex.exec(markdown)) !== null) {
    const filename = (m[1] || "").trim()
    const languageHint = (m[2] || "").trim()
    const content = (m[3] || "").trim()
    if (!filename || !content || byName.has(filename)) continue
    byName.add(filename)
    files.push({
      name: filename,
      content,
      language: detectLanguage(content, filename || languageHint),
      path: "src",
    })
  }

  // Fallback: numbered code fences without explicit filenames.
  if (files.length === 0) {
    const fallbackFenceRegex = /```([\w+-]*)\n([\s\S]*?)```/g
    let idx = 1
    while ((m = fallbackFenceRegex.exec(markdown)) !== null) {
      const lang = (m[1] || "text").trim()
      const content = (m[2] || "").trim()
      if (!content) continue
      files.push({
        name: `snippet_${idx}.${getExtension(lang)}`,
        content,
        language: detectLanguage(content, lang),
        path: "src",
      })
      idx += 1
    }
  }

  const whyMatch = markdown.match(/###\s*Why this works:\s*([\s\S]*?)(?:\n###|\n\*\*|\n##|$)/i)
  const runMatch = markdown.match(/###\s*How to run this:\s*([\s\S]*?)(?:\n###|\n\*\*|\n##|$)/i)
  const introMatch = markdown.match(/^[\s\S]*?(?=###\s*1\.)/i)

  const parseBullets = (block: string | undefined): string[] => {
    if (!block) return []
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^\d+\.\s+/.test(l) || /^-\s+/.test(l))
      .map((l) => l.replace(/^\d+\.\s+/, "").replace(/^-\s+/, "").trim())
      .filter(Boolean)
    return lines
  }

  const features = parseBullets(whyMatch?.[1])
  const howToRunSteps = parseBullets(runMatch?.[1])
  const description = introMatch?.[0]
    ? sanitizeMarkdownSectionBody(
        introMatch[0]
          .replace(/^#+\s.*$/gm, "")
          .replace(/```[\s\S]*?```/g, "")
      )
    : undefined

  return {
    files,
    description: description && description.length > 0 ? description : undefined,
    features: features.length > 0 ? features : undefined,
    howToRun: howToRunSteps.length > 0 ? howToRunSteps.map((s, i) => `${i + 1}. ${s}`).join("\n") : undefined,
  }
}

const SOURCE_FILE_KEY = /\.(html|htm|css|js|mjs|cjs|tsx|ts|jsx|json|py|md|xml|yaml|yml|vue|svelte)$/i

const CONTENT_VALUE_KEYS = [
  "content",
  "file_content",
  "html",
  "html_content",
  "source",
  "body",
  "text",
  "markdown",
  "source_code",
  "code",
  "css",
  "snippet",
  "payload",
  "template",
  "markup",
] as const

function splitPathAndLeaf(fullPath: string): { dir: string; leaf: string } {
  const parts = fullPath.split("/").filter(Boolean)
  if (parts.length === 0) return { dir: "", leaf: "" }
  const leaf = parts[parts.length - 1]!
  const dir = parts.slice(0, -1).join("/")
  return { dir, leaf }
}

function stringifyStructuredFileValue(value: unknown, key: string): string | null {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const lowerKey = key.toLowerCase()
  if (lowerKey.endsWith(".json")) {
    try {
      return `${JSON.stringify(value, null, 2)}\n`
    } catch {
      return null
    }
  }
  return null
}

function pickStringContent(o: Record<string, unknown>): string {
  for (const k of CONTENT_VALUE_KEYS) {
    const v = o[k]
    if (typeof v === "string" && v.length > 0) return v
  }
  return ""
}

function looksLikeFileRecord(o: Record<string, unknown>): boolean {
  if (!pickStringContent(o)) return false
  return Boolean(
    typeof o.path === "string" ||
      typeof o.file_path === "string" ||
      typeof o.name === "string" ||
      typeof o.file === "string" ||
      typeof o.filename === "string"
  )
}

/**
 * Detect files embedded in agent payloads (html_files_generated, pages, nested webapp/src, etc.).
 * Deep-parses nested JSON strings first. Merges duplicates by path/name, keeping the longer body.
 */
export function extractStructuredCodeFiles(data: unknown): CodeFile[] {
  const byKey = new Map<string, CodeFile>()

  function mergeFile(folder: string | undefined, name: string, content: string) {
    if (typeof content !== "string" || content.length === 0) return
    const leaf = (name || "snippet.txt").replace(/^\/+/, "")
    const fdir = (folder || "").replace(/^\/+|\/+$/g, "")
    const mapKey = `${fdir}|||${leaf}`
    const next: CodeFile = {
      name: leaf,
      content,
      language: detectLanguage(content, leaf),
      path: fdir || undefined,
    }
    const prev = byKey.get(mapKey)
    if (!prev || content.length > prev.content.length) {
      byKey.set(mapKey, next)
    }
  }

  function extractFileRecord(o: Record<string, unknown>, folderHint: string) {
    const content = pickStringContent(o)
    if (!content) return

    const pathField =
      (typeof o.path === "string" && o.path) || (typeof o.file_path === "string" && o.file_path) || ""

    let nameField =
      (typeof o.name === "string" && o.name) ||
      (typeof o.file === "string" && o.file) ||
      (typeof o.filename === "string" && o.filename) ||
      ""

    let leaf = ""
    let relDir = ""

    if (pathField) {
      const sp = splitPathAndLeaf(pathField)
      leaf = sp.leaf || nameField
      relDir = sp.dir
    } else if (nameField.includes("/")) {
      const sp = splitPathAndLeaf(nameField)
      leaf = sp.leaf
      relDir = sp.dir
    } else {
      leaf = nameField || "snippet.txt"
      relDir = ""
    }

    if (!leaf) leaf = "snippet.txt"
    const folder = [folderHint, relDir].filter(Boolean).join("/") || undefined
    mergeFile(folder, leaf, content)
  }

  let root: unknown = data
  if (typeof root === "string") {
    const t = root.trim()
    if (!t) return []
    try {
      root = JSON.parse(t)
    } catch {
      return []
    }
  }

  root = deepParseJsonTree(root, 14)

  if (root === null || root === undefined) return []
  if (typeof root !== "object") return []

  function visit(node: unknown, folderHint: string, depth: number): void {
    if (depth > 64) return
    if (node === null || node === undefined) return
    if (typeof node === "string") return

    if (Array.isArray(node)) {
      for (const item of node) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const o = item as Record<string, unknown>
          if (looksLikeFileRecord(o)) {
            extractFileRecord(o, folderHint)
          }
        }
        visit(item, folderHint, depth + 1)
      }
      return
    }

    const o = node as Record<string, unknown>

    if (typeof o.file_path === "string") {
      const raw = pickStringContent(o)
      if (raw) {
        const parts = o.file_path.split("/").filter(Boolean)
        const leaf = parts.pop() || "file"
        const rel = parts.join("/")
        const folder = [folderHint, rel].filter(Boolean).join("/") || undefined
        mergeFile(folder, leaf, raw)
      }
    }

    if (o.generated_html && typeof o.generated_html === "object" && !Array.isArray(o.generated_html)) {
      for (const [fn, content] of Object.entries(o.generated_html)) {
        if (typeof content === "string") mergeFile(folderHint || undefined, fn, content)
      }
    }

    if (Array.isArray(o.html_files_generated)) {
      visit(o.html_files_generated, folderHint, depth + 1)
    }
    if (o.updated_pages && typeof o.updated_pages === "object") {
      visit(o.updated_pages, folderHint, depth + 1)
    }

    for (const [key, value] of Object.entries(o)) {
      if (value === null || value === undefined) continue
      if (key === "partial_results" || isInternalPipelineAgentId(key)) continue
      if (SOURCE_FILE_KEY.test(key)) {
        const fileContent = stringifyStructuredFileValue(value, key)
        if (fileContent !== null) {
          if (key.includes("/")) {
            const sp = splitPathAndLeaf(key)
            const folder = [folderHint, sp.dir].filter(Boolean).join("/") || undefined
            mergeFile(folder, sp.leaf || key, fileContent)
          } else {
            mergeFile(folderHint || undefined, key, fileContent)
          }
          continue
        }
      }
      if (typeof value === "object") {
        const nextFolder =
          key === "webapp"
            ? folderHint
            : key === "src" ||
                key === "css" ||
                key === "assets" ||
                key === "public" ||
                key === "static" ||
                key === "dist" ||
                key === "build"
              ? [folderHint, key].filter(Boolean).join("/")
              : folderHint
        visit(value, nextFolder, depth + 1)
      }
    }
  }

  visit(root, "", 0)

  const out = Array.from(byKey.values())
  out.sort((a, b) => {
    const pa = a.path || ""
    const pb = b.path || ""
    if (pa !== pb) return pa.localeCompare(pb)
    return a.name.localeCompare(b.name)
  })
  return out
}

/**
 * Recursively search for code blocks in the result object
 */
function findCodeBlocks(obj: any, path: string = ""): CodeFile[] {
  const files: CodeFile[] = []

  if (typeof obj === "string") {
    // Check if it's a code block (markdown code fence or JSON string containing code)
    const codeBlockMatch = obj.match(/```(\w+)?\n([\s\S]*?)```/g)
    if (codeBlockMatch) {
      codeBlockMatch.forEach((block) => {
        const match = block.match(/```(\w+)?\n([\s\S]*?)```/)
        if (match) {
          const language = match[1] || "text"
          const content = match[2]
          files.push({
            name: `code_${files.length + 1}.${getExtension(language)}`,
            content: content.trim(),
            language: language,
            path: "src",
          })
        }
      })
    }

    // Check if it's JSON containing code
    try {
      const parsed = JSON.parse(obj)
      if (typeof parsed === "object") {
        files.push(...findCodeBlocks(parsed, path))
      }
    } catch {
      // Not JSON, ignore
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      files.push(...findCodeBlocks(item, `${path}[${index}]`))
    })
  } else if (obj && typeof obj === "object") {
    Object.entries(obj).forEach(([key, value]) => {
      if (key === "partial_results" || isInternalPipelineAgentId(key)) return
      const newPath = path ? `${path}.${key}` : key

      // Check for common code fields
      if (
        key.toLowerCase().includes("code") ||
        key.toLowerCase().includes("implementation") ||
        key.toLowerCase().includes("script")
      ) {
        if (typeof value === "string" && value.length > 50) {
          // Likely code content
          const language = detectLanguage(value, key)
          files.push({
            name: `${sanitizeFileName(key)}.${getExtension(language)}`,
            content: value.trim(),
            language: language,
            path: "src",
          })
        } else if (value && typeof value === "object") {
          // Nested object, might contain code
          files.push(...findCodeBlocks(value, newPath))
        }
      } else {
        files.push(...findCodeBlocks(value, newPath))
      }
    })
  }

  return files
}

/**
 * Recursively parse JSON strings until we get an object (nested stringified JSON from APIs).
 */
/** Keys that look like file paths (LLMs often emit Python repr dicts, not JSON). */
const LOOSE_FILE_MAP_KEY = /\.(html|htm|css|js|mjs|cjs|tsx|ts|jsx|json|py|md|xml|yaml|yml|vue|svelte)$/i

function readPythonSingleQuotedString(s: string, start: number): { value: string; end: number } | null {
  if (s[start] !== "'") return null
  let i = start + 1
  let out = ""
  while (i < s.length) {
    const c = s[i]!
    if (c === "\\") {
      i++
      if (i >= s.length) return null
      const esc = s[i]!
      if (esc === "n") out += "\n"
      else if (esc === "t") out += "\t"
      else if (esc === "r") out += "\r"
      else if (esc === "'" || esc === "\\") out += esc
      else out += esc
      i++
      continue
    }
    if (c === "'") {
      return { value: out, end: i + 1 }
    }
    out += c
    i++
  }
  return null
}

function tryParsePythonStringDictAt(
  s: string,
  start: number
): { record: Record<string, string>; end: number } | null {
  let i = start
  while (i < s.length && /\s/.test(s[i]!)) i++
  if (s[i] !== "{") return null
  i++
  const record: Record<string, string> = {}
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i]!)) i++
    if (s[i] === "}") {
      if (Object.keys(record).length === 0) return null
      return { record, end: i + 1 }
    }
    const keyR = readPythonSingleQuotedString(s, i)
    if (!keyR) return null
    i = keyR.end
    while (i < s.length && /\s/.test(s[i]!)) i++
    if (s[i] !== ":") return null
    i++
    while (i < s.length && /\s/.test(s[i]!)) i++
    const valR = readPythonSingleQuotedString(s, i)
    if (!valR) return null
    record[keyR.value] = valR.value
    i = valR.end
    while (i < s.length && /\s/.test(s[i]!)) i++
    if (s[i] === "}") {
      return { record, end: i + 1 }
    }
    if (s[i] === ",") {
      i++
      continue
    }
    return null
  }
  return null
}

function isFileMapRecord(obj: Record<string, string>): boolean {
  return Object.keys(obj).some((k) => LOOSE_FILE_MAP_KEY.test(k))
}

function tryParseJsonFileMapAt(
  s: string,
  start: number
): { record: Record<string, string>; end: number } | null {
  if (s[start] !== "{") return null
  for (let end = start + 1; end < s.length; end++) {
    if (s[end] !== "}") continue
    const slice = s.slice(start, end + 1)
    try {
      const v = JSON.parse(slice) as unknown
      if (typeof v !== "object" || v === null || Array.isArray(v)) continue
      const rec: Record<string, string> = {}
      for (const [k, val] of Object.entries(v)) {
        if (typeof val === "string") rec[k] = val
      }
      if (Object.keys(rec).length === 0 || !isFileMapRecord(rec)) continue
      return { record: rec, end: end + 1 }
    } catch {
      continue
    }
  }
  return null
}

function tryParseFileMapLiteralAt(
  s: string,
  start: number
): { record: Record<string, string>; end: number } | null {
  const py = tryParsePythonStringDictAt(s, start)
  if (py && isFileMapRecord(py.record)) return py
  return tryParseJsonFileMapAt(s, start)
}

export interface LooseAgentFileMapSpan {
  start: number
  end: number
  record: Record<string, string>
}

/**
 * Find Python- or JSON-style `{ 'path.ext': '...', ... }` blobs in a larger string
 * (common when multiple sub-agents concatenate dict reprs into one `result` field).
 */
export function findLooseFileMapSpans(text: string): LooseAgentFileMapSpan[] {
  const raw: LooseAgentFileMapSpan[] = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue
    const parsed = tryParseFileMapLiteralAt(text, i)
    if (!parsed) continue
    raw.push({ start: i, end: parsed.end, record: parsed.record })
  }
  raw.sort((a, b) => a.start - b.start)
  const merged: LooseAgentFileMapSpan[] = []
  for (const span of raw) {
    const last = merged[merged.length - 1]
    if (last && span.start < last.end) {
      if (span.end - span.start > last.end - last.start) {
        merged[merged.length - 1] = span
      }
    } else {
      merged.push(span)
    }
  }
  return merged
}

export type LooseAgentSegment =
  | { kind: "text"; text: string; preferCode: boolean }
  | { kind: "fileMap"; files: CodeFile[] }

function segmentLooksLikeSourceCode(s: string): boolean {
  const t = s.trim()
  if (t.length < 16) return false
  const head = (t.split("\n")[0] || "").trim()
  return /^(const|let|var|function|import|export|class|interface|type)\b/.test(head)
}

function dedupeRepeatedTextSegments(segments: LooseAgentSegment[]): LooseAgentSegment[] {
  const seen = new Set<string>()
  return segments.filter((seg) => {
    if (seg.kind !== "text") return true
    const k = seg.text.trim().replace(/\s+/g, " ")
    if (k.length < 80) return true
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/**
 * Split a long agent string into alternating prose and structured file maps.
 * Returns `null` if no file-map literals were found (caller should use normal rendering).
 */
export function segmentLooseAgentOutput(text: string): LooseAgentSegment[] | null {
  const spans = findLooseFileMapSpans(text)
  if (spans.length === 0) return null

  const out: LooseAgentSegment[] = []
  let cursor = 0
  for (const sp of spans) {
    if (sp.start > cursor) {
      const t = text.slice(cursor, sp.start).trim()
      if (t) {
        out.push({ kind: "text", text: t, preferCode: segmentLooksLikeSourceCode(t) })
      }
    }
    const files = extractStructuredCodeFiles(sp.record)
    if (files.length > 0) {
      out.push({ kind: "fileMap", files })
    }
    cursor = sp.end
  }
  if (cursor < text.length) {
    const t = text.slice(cursor).trim()
    if (t) {
      out.push({ kind: "text", text: t, preferCode: segmentLooksLikeSourceCode(t) })
    }
  }

  const deduped = dedupeRepeatedTextSegments(out)
  return deduped.length > 0 ? deduped : null
}

function normalizeComparableContent(s: string): string {
  return s.trim().replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n")
}

/**
 * Remove fenced code blocks whose body matches an extracted project file (stops HTML/CSS/JS showing twice).
 */
export function stripMarkdownFencesMatchingFileContents(text: string, files: CodeFile[]): string {
  if (files.length === 0) return text
  const norms = new Set(files.map((f) => normalizeComparableContent(f.content)))
  const out = text.replace(/```[\w]*\n([\s\S]*?)```/g, (full, inner: string) => {
    if (norms.has(normalizeComparableContent(inner))) return ""
    return full
  })
  return out.replace(/\n{3,}/g, "\n\n").trim()
}

/**
 * Merge every inline `{ 'path/file.ext': '...' }` / JSON file-map blob and remove those spans from text.
 */
export function mergeLooseFileMapRecordsFromText(text: string): {
  mergedRecord: Record<string, string>
  cleanedText: string
} {
  const spans = findLooseFileMapSpans(text)
  if (spans.length === 0) {
    return { mergedRecord: {}, cleanedText: text }
  }
  const mergedRecord: Record<string, string> = {}
  for (const sp of spans) {
    for (const [k, v] of Object.entries(sp.record)) {
      const prev = mergedRecord[k]
      if (!prev || v.length > prev.length) mergedRecord[k] = v
    }
  }
  let cleaned = text
  for (let i = spans.length - 1; i >= 0; i--) {
    const sp = spans[i]!
    cleaned = cleaned.slice(0, sp.start) + "\n\n" + cleaned.slice(sp.end)
  }
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim()
  return { mergedRecord, cleanedText: cleaned }
}

/**
 * One pass: merge all loose file maps in a result string, extract a single deduped file list, leave readable prose.
 */
export function extractUnifiedFilesFromAgentResultText(text: string): { files: CodeFile[]; prose: string } {
  const { mergedRecord, cleanedText } = mergeLooseFileMapRecordsFromText(text)
  if (Object.keys(mergedRecord).length === 0) {
    return { files: [], prose: text }
  }
  const files = extractStructuredCodeFiles(mergedRecord)
  const prose = stripMarkdownFencesMatchingFileContents(cleanedText, files)
  return { files, prose }
}

/**
 * Pull structured files from one agent payload (string or research-shaped object).
 */
export function extractCodeFilesFromAgentPayload(value: unknown): CodeFile[] {
  if (value === null || value === undefined) return []
  let cur: unknown = value
  if (typeof cur === "string") {
    const t = cur.trim()
    if (!t) return []
    try {
      cur = JSON.parse(t)
    } catch {
      const { files } = extractUnifiedFilesFromAgentResultText(t)
      if (files.length > 0) return files
      return extractStructuredCodeFiles(t)
    }
  }
  if (typeof cur === "object" && cur !== null && !Array.isArray(cur)) {
    const o = cur as Record<string, unknown>
    if ("result" in o && o.result !== undefined && o.result !== null) {
      const inner = extractCodeFilesFromAgentPayload(o.result)
      if (inner.length > 0) return inner
    }
    return extractStructuredCodeFiles(cur)
  }
  return []
}

/**
 * Merge files from all parallel agents into one tree (longer body wins per path).
 */
export function mergeCodeFilesFromPartialResults(results: Record<string, unknown>): CodeFile[] {
  const byKey = new Map<string, CodeFile>()
  for (const [agentId, val] of Object.entries(results)) {
    if (isInternalPipelineAgentId(agentId)) continue
    for (const f of extractCodeFilesFromAgentPayload(val)) {
      const dir = (f.path || "").replace(/^\/+|\/+$/g, "")
      const leaf = f.name.replace(/^\/+/, "")
      const mapKey = `${dir}|||${leaf}`
      const prev = byKey.get(mapKey)
      if (!prev || f.content.length > prev.content.length) {
        byKey.set(mapKey, { ...f, path: dir || undefined, name: leaf })
      }
    }
  }
  const out = Array.from(byKey.values())
  out.sort((a, b) => {
    const pa = a.path || ""
    const pb = b.path || ""
    if (pa !== pb) return pa.localeCompare(pb)
    return a.name.localeCompare(b.name)
  })
  return out
}

export function getPartialResultConfidence(value: unknown): number | null {
  if (value === null || value === undefined) return null
  let cur: unknown = value
  if (typeof cur === "string") {
    const t = cur.trim()
    if (!t) return null
    try {
      cur = JSON.parse(t)
    } catch {
      return null
    }
  }
  if (!cur || typeof cur !== "object" || Array.isArray(cur)) return null
  const o = cur as Record<string, unknown>
  const c = o.confidence
  if (typeof c === "number" && Number.isFinite(c)) return c
  return null
}

/**
 * Raw confidence scalars from research-shaped agent payloads (typically 0–1 or 0–100).
 */
export function collectPartialResultConfidences(results: Record<string, unknown>): number[] {
  const out: number[] = []
  for (const val of Object.values(results)) {
    const c = getPartialResultConfidence(val)
    if (c !== null) out.push(c)
  }
  return out
}

export function deepParseJsonTree(value: any, maxDepth: number = 5): any {
  if (maxDepth <= 0) return value

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === "string") {
        return deepParseJsonTree(parsed, maxDepth - 1)
      }
      return deepParseJsonTree(parsed, maxDepth - 1)
    } catch {
      return value
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepParseJsonTree(item, maxDepth - 1))
  }

  if (value && typeof value === "object") {
    const result: any = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = deepParseJsonTree(val, maxDepth - 1)
    }
    return result
  }

  return value
}

/**
 * Extract code and metadata from task result
 */
export function extractCodeFromResult(result: any): ExtractedCode {
  if (!result) {
    return { files: [] }
  }

  // Deep parse JSON strings - try multiple times to handle nested JSON
  let parsedResult = deepParseJsonTree(result)
  
  // If still a string, try to extract JSON from markdown code blocks
  if (typeof parsedResult === "string") {
    const tutorial = parseTutorialMarkdownOutput(parsedResult)
    if (tutorial.files && tutorial.files.length > 0) {
      return {
        files: tutorial.files,
        description: tutorial.description,
        features: tutorial.features,
        howToRun: tutorial.howToRun,
        metadata: { raw: parsedResult },
      }
    }
    const jsonMatch = parsedResult.match(/```json\s*\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        parsedResult = JSON.parse(jsonMatch[1])
        parsedResult = deepParseJsonTree(parsedResult)
      } catch {
        // If it's not JSON, check if it's a code block
        const codeMatch = parsedResult.match(/```(\w+)?\n([\s\S]*?)```/)
        if (codeMatch) {
          const language = codeMatch[1] || "text"
          return {
            files: [
              {
                name: `main.${getExtension(language)}`,
                content: codeMatch[2].trim(),
                language: language,
                path: "src",
              },
            ],
          }
        }
        return { files: [] }
      }
    } else {
      // Check if it's a code block
      const codeMatch = parsedResult.match(/```(\w+)?\n([\s\S]*?)```/)
      if (codeMatch) {
        const language = codeMatch[1] || "text"
        return {
          files: [
            {
              name: `main.${getExtension(language)}`,
              content: codeMatch[2].trim(),
              language: language,
              path: "src",
            },
          ],
        }
      }
      return { files: [] }
    }
  }

  // Extract code files
  const files: CodeFile[] = []
  const variants: CodeVariant[] = []

  // Extract metadata
  let finalResult = parsedResult.final_result || parsedResult
  
  // Handle case where final_result is still a string
  if (typeof finalResult === "string") {
    const tutorial = parseTutorialMarkdownOutput(finalResult)
    if (tutorial.files && tutorial.files.length > 0) {
      return {
        files: tutorial.files,
        description: tutorial.description,
        features: tutorial.features,
        howToRun: tutorial.howToRun,
        metadata: parsedResult,
      }
    }
    try {
      finalResult = JSON.parse(finalResult)
      finalResult = deepParseJsonTree(finalResult)
    } catch {
      // If parsing fails, try to extract from markdown
      const jsonMatch = finalResult.match(/```json\s*\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        try {
          finalResult = JSON.parse(jsonMatch[1])
          finalResult = deepParseJsonTree(finalResult)
        } catch {
          finalResult = parsedResult
        }
      }
    }
  }

  const metadata: Record<string, any> = {}

  // Try to extract structured information
  if (finalResult && typeof finalResult === "object") {
    // Get the actual final_result if nested
    const actualResult = finalResult.final_result || finalResult
    
    if (actualResult.description) metadata.description = actualResult.description
    if (actualResult.requirements) metadata.requirements = actualResult.requirements
    if (actualResult.how_to_run) metadata.howToRun = actualResult.how_to_run
    if (actualResult.howToRun) metadata.howToRun = actualResult.howToRun
    if (actualResult.features) metadata.features = actualResult.features
    if (actualResult.limitations) metadata.limitations = actualResult.limitations
    if (actualResult.possible_extensions) metadata.extensions = actualResult.possible_extensions
    if (actualResult.extensions) metadata.extensions = actualResult.extensions

    // Check implementation object - this is where variants come from
    if (actualResult.implementation) {
      Object.entries(actualResult.implementation).forEach(([lang, impl]: [string, any]) => {
        if (impl && typeof impl === "object") {
          const variantFiles: CodeFile[] = []
          
          if (impl.code) {
            let codeContent = typeof impl.code === "string" ? impl.code : JSON.stringify(impl.code, null, 2)
            
            // Handle escaped markdown code fences (from JSON strings)
            codeContent = codeContent.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'")
            
            // Remove markdown code fences if present
            let cleanCode = codeContent
              .replace(/^```[\w]*\n?/gm, "")
              .replace(/```$/gm, "")
              .replace(/```/g, "")
              .trim()
            
            // If still has escaped characters, try to unescape more
            if (cleanCode.includes("\\")) {
              try {
                cleanCode = JSON.parse(`"${cleanCode.replace(/"/g, '\\"')}"`)
              } catch {
                // Keep as is
              }
            }
            
            // Only add if we have actual code content
            if (cleanCode.length > 10) { // Minimum code length
              const codeFile: CodeFile = {
                name: `main.${getExtension(lang)}`,
                content: cleanCode,
                language: lang,
                path: "src",
              }
              files.push(codeFile)
              variantFiles.push(codeFile)
            }
          }
          
          // Create variant if we have files
          if (variantFiles.length > 0) {
            variants.push({
              id: lang,
              name: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Implementation`,
              language: lang,
              files: variantFiles,
              description: impl.description || actualResult.description,
              requirements: impl.requirements || metadata.requirements,
              howToRun: impl.how_to_run || impl.howToRun || metadata.howToRun,
              features: impl.features || metadata.features,
            })
          }
          
          if (impl.requirements && !metadata.requirements) metadata.requirements = impl.requirements
          if (impl.how_to_run && !metadata.howToRun) metadata.howToRun = impl.how_to_run
        }
      })
    }
    
    // Also search for code blocks in the entire structure
    const foundFiles = findCodeBlocks(actualResult)
    foundFiles.forEach(file => {
      if (!files.find(f => f.name === file.name && f.content === file.content)) {
        if (!file.path && !isDocumentLikeFile(file)) {
          file.path = "src"
        }
        files.push(file)
      }
    })

    const structuredFiles = extractStructuredCodeFiles(actualResult)
    structuredFiles.forEach((file) => {
      if (!files.find((f) => f.name === file.name && f.content === file.content && f.path === file.path)) {
        if (!file.path && !isDocumentLikeFile(file)) {
          file.path = "src"
        }
        files.push(file)
      }
    })
  }

  return {
    files: files.length > 0 ? files : [],
    variants: variants.length > 0 ? variants : undefined,
    description: metadata.description,
    requirements: metadata.requirements,
    howToRun: metadata.howToRun,
    features: metadata.features,
    limitations: metadata.limitations,
    extensions: metadata.extensions,
    metadata: parsedResult,
  }
}

/** Map file extension (no dot) → Prism-style language id for UI labels */
const EXT_TO_LANGUAGE: Record<string, string> = {
  py: "python",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  java: "java",
  cpp: "cpp",
  cxx: "cpp",
  cc: "cpp",
  hpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  json: "json",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  vue: "vue",
  svelte: "svelte",
  sql: "sql",
  sh: "shell",
  bash: "shell",
}

function languageFromFilename(key: string): string | null {
  const basename = (key.toLowerCase().split(/[/\\]/).pop() || key.toLowerCase()).trim()
  const m = /\.([a-z0-9]+)$/i.exec(basename)
  if (!m) return null
  const ext = m[1]!.toLowerCase()
  return EXT_TO_LANGUAGE[ext] ?? null
}

function isDocumentLikeFile(file: CodeFile): boolean {
  const lang = (file.language || "").toLowerCase()
  if (lang === "markdown" || lang === "text" || lang === "plaintext") return true
  return /\.(md|markdown|txt)$/i.test(file.name || "")
}

/**
 * Detect programming language from code content or key name.
 * Uses the true file extension first so `.css` is never mistaken for `.cs`, and `.json` for `.js`.
 */
function detectLanguage(content: string, key: string = ""): string {
  const fromName = languageFromFilename(key)
  if (fromName) return fromName

  const lowerKey = key.toLowerCase()
  const trimmed = content.trim()
  const lowerContent = trimmed.toLowerCase().slice(0, 400)

  if (/^<!doctype\b/i.test(trimmed) || /^<\s*html[\s>]/i.test(trimmed)) {
    return "html"
  }

  // Key hints when there is no extension (e.g. nested object keys)
  if (lowerKey.includes("python") || lowerKey.endsWith(".py")) return "python"
  if (lowerKey.includes("typescript")) return "typescript"
  if (lowerKey.includes("javascript")) return "javascript"
  if (lowerKey.includes("java") && !lowerKey.includes("javascript")) return "java"
  if (lowerKey.includes("cpp") || lowerKey.includes("c++")) return "cpp"
  if (lowerKey.includes("c#")) return "csharp"
  if (lowerKey.includes("rust")) return "rust"
  if (lowerKey.includes("html") && !lowerKey.includes(".htm")) return "html"

  // Check content patterns (HTML/CSS before JS — many pages include script tags)
  if (
    lowerContent.includes("{") &&
    (/^\s*[.#@][a-zA-Z_-]/.test(trimmed) || lowerContent.includes("margin:") || lowerContent.includes("display:"))
  ) {
    return "css"
  }
  if (lowerContent.includes("def ") || (lowerContent.includes("import ") && lowerContent.includes("\n"))) {
    return "python"
  }
  if (lowerContent.includes("public class") || lowerContent.includes("public static")) {
    return "java"
  }
  if (lowerContent.includes("#include") || lowerContent.includes("int main")) {
    return "cpp"
  }
  if (lowerContent.includes("package ") && lowerContent.includes("func ")) {
    return "go"
  }
  if (lowerContent.includes("function ") || lowerContent.includes("const ") || lowerContent.includes("let ")) {
    return "javascript"
  }

  return "text"
}

/**
 * Get file extension from language
 */
function getExtension(language: string): string {
  const extMap: Record<string, string> = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    html: "html",
    css: "css",
    json: "json",
    yaml: "yaml",
    yml: "yml",
    markdown: "md",
    md: "md",
    shell: "sh",
    bash: "sh",
    sql: "sql",
    xml: "xml",
  }

  return extMap[language.toLowerCase()] || "txt"
}

/**
 * Sanitize file name
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase()
    .substring(0, 50)
}

/**
 * Generate README content from extracted code
 */
export function generateREADME(extracted: ExtractedCode, taskDescription?: string, selectedVariant?: CodeVariant): string {
  const lines: string[] = []
  const variant = selectedVariant || (extracted.variants && extracted.variants[0])

  lines.push("# Task Result")
  lines.push("")
  if (taskDescription) {
    lines.push(`## Task Description`)
    lines.push("")
    lines.push(taskDescription)
    lines.push("")
  }

  if (variant) {
    lines.push(`## Implementation: ${variant.name}`)
    lines.push("")
  }

  if (variant?.description || extracted.description) {
    lines.push("## Description")
    lines.push("")
    lines.push(variant?.description || extracted.description || "")
    lines.push("")
  }

  if (extracted.files.length > 0 || variant?.files) {
    lines.push("## Project Structure")
    lines.push("")
    lines.push("```")
    const filesToShow = variant?.files || extracted.files
    filesToShow.forEach((file) => {
      const path = file.path ? `${file.path}/` : ""
      lines.push(`${path}${file.name}`)
    })
    lines.push("```")
    lines.push("")
  }

  if (variant?.requirements || extracted.requirements) {
    lines.push("## Requirements")
    lines.push("")
    lines.push(variant?.requirements || extracted.requirements || "")
    lines.push("")
  }

  if (variant?.howToRun || extracted.howToRun) {
    lines.push("## How to Run")
    lines.push("")
    lines.push(variant?.howToRun || extracted.howToRun || "")
    lines.push("")
  }

  if (variant?.features || extracted.features) {
    const features = variant?.features || extracted.features || []
    if (features.length > 0) {
      lines.push("## Features")
      lines.push("")
      features.forEach((feature) => {
        lines.push(`- ${feature}`)
      })
      lines.push("")
    }
  }

  if (extracted.limitations && extracted.limitations.length > 0) {
    lines.push("## Limitations")
    lines.push("")
    extracted.limitations.forEach((limitation) => {
      lines.push(`- ${limitation}`)
    })
    lines.push("")
  }

  if (extracted.extensions && extracted.extensions.length > 0) {
    lines.push("## Possible Extensions")
    lines.push("")
    extracted.extensions.forEach((ext) => {
      lines.push(`### ${ext.name}`)
      lines.push("")
      lines.push(`${ext.description}`)
      lines.push("")
      lines.push(`**Difficulty:** ${ext.difficulty}`)
      lines.push("")
    })
  }

  if (extracted.variants && extracted.variants.length > 1) {
    lines.push("## Available Variants")
    lines.push("")
    extracted.variants.forEach((v) => {
      lines.push(`- **${v.name}** (${v.language})`)
    })
    lines.push("")
    lines.push("Note: This download contains the selected variant. Other variants are available in the web interface.")
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push(`Generated by MasterNode.ai`)
  lines.push(`Generated at: ${new Date().toISOString()}`)

  return lines.join("\n")
}

const LLM_TASK_CONTEXT_HEADER =
  "ACTUAL_PIPELINE_OUTPUT (authoritative). When the user asks for consolidated or generated code, base your answer ONLY on this — do not substitute generic demo pages or placeholder projects.\n"

/**
 * Serialized task output for support-chat session context so the LLM sees real artifacts,
 * not only the short “task completed” line in the transcript.
 */
export function formatTaskOutputForLlmContext(result: unknown, maxChars: number): string {
  if (result == null || maxChars < 200) return ""

  const extracted = extractCodeFromResult(result as any)
  const files =
    extracted.variants && extracted.variants.length > 0
      ? extracted.variants[0]!.files
      : extracted.files

  const header = LLM_TASK_CONTEXT_HEADER
  if (files.length > 0) {
    const perFileCap = Math.min(14_000, Math.floor((maxChars - header.length) / Math.max(1, files.length)))
    const parts: string[] = [header]
    for (const f of files) {
      const rel = [f.path, f.name].filter(Boolean).join("/") || f.name
      let body = f.content
      if (body.length > perFileCap) {
        body = `${body.slice(0, perFileCap)}\n…[truncated]`
      }
      parts.push(`### File: ${rel}\n${body}\n`)
    }
    let out = parts.join("\n")
    if (out.length > maxChars) {
      out = `${out.slice(0, maxChars - 24)}\n…[truncated]`
    }
    return out
  }

  let raw: string
  try {
    raw = typeof result === "string" ? result : JSON.stringify(result, null, 2)
  } catch {
    raw = String(result)
  }
  const budget = maxChars - header.length - 40
  if (raw.length > budget) {
    raw = `${raw.slice(0, budget)}\n…[truncated]`
  }
  return `${header}\n${raw}`
}
