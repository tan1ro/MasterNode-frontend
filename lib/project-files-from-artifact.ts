import { extractCodeFromResult, type CodeFile } from "@/lib/task-result-parser"
import {
  projectFileZipPath,
  uniqueProjectFiles,
  type ProjectExportFile,
} from "@/lib/project-zip-export"

function isHtmlPath(path: string): boolean {
  return /\.html?$/i.test(path)
}

function isGenericHtmlPath(path: string): boolean {
  const base = path.split("/").pop() || path
  return /^index\.html?$/i.test(base) || /^file_\d+\.html?$/i.test(base)
}

function htmlSignature(content: string): string {
  return content.replace(/\s+/g, " ").trim()
}

/** Same document under two names (e.g. index.html vs pok_dex_explorer.html). */
function isEquivalentHtml(a: string, b: string): boolean {
  const na = htmlSignature(a)
  const nb = htmlSignature(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const shorter = na.length <= nb.length ? na : nb
  const longer = na.length > nb.length ? na : nb
  return shorter.length >= 40 && longer.includes(shorter)
}

function pickPreferredHtml(
  a: ProjectExportFile,
  b: ProjectExportFile,
  preferredPath?: string
): ProjectExportFile {
  const longer = a.content.length >= b.content.length ? a.content : b.content
  if (preferredPath) {
    if (a.path === preferredPath) return { path: a.path, content: longer }
    if (b.path === preferredPath) return { path: b.path, content: longer }
  }
  const aGeneric = isGenericHtmlPath(a.path)
  const bGeneric = isGenericHtmlPath(b.path)
  if (aGeneric && !bGeneric) return { path: b.path, content: longer }
  if (bGeneric && !aGeneric) return { path: a.path, content: longer }
  return a.content.length >= b.content.length ? a : b
}

/** Keep one HTML document when the same page was collected under two paths. */
export function dedupeEquivalentHtmlFiles(
  files: ProjectExportFile[],
  preferredHtmlPath?: string
): ProjectExportFile[] {
  const htmlFiles: ProjectExportFile[] = []
  const other: ProjectExportFile[] = []
  for (const file of files) {
    if (isHtmlPath(file.path)) htmlFiles.push(file)
    else other.push(file)
  }
  const kept: ProjectExportFile[] = []
  for (const file of htmlFiles) {
    const dupIdx = kept.findIndex((existing) => isEquivalentHtml(existing.content, file.content))
    if (dupIdx < 0) {
      kept.push(file)
      continue
    }
    kept[dupIdx] = pickPreferredHtml(kept[dupIdx], file, preferredHtmlPath)
  }
  return uniqueProjectFiles([...other, ...kept])
}

function fromCodeFiles(files: CodeFile[]): ProjectExportFile[] {
  const out: ProjectExportFile[] = []
  for (const file of files) {
    const path = projectFileZipPath(file)
    if (!path) continue
    out.push({ path, content: file.content })
  }
  return out
}

const FENCE_RE = /```([^\n]*)\n([\s\S]*?)```/g

function filesFromMarkdownFences(markdown: string): ProjectExportFile[] {
  const out: ProjectExportFile[] = []
  const re = new RegExp(FENCE_RE.source, "g")
  let match: RegExpExecArray | null
  let index = 1
  while ((match = re.exec(markdown || ""))) {
    const info = (match[1] || "").trim()
    const body = (match[2] || "").replace(/\n$/, "")
    if (body.trim().length < 8) continue
    let path = ""
    if (info.includes(":")) {
      path = info.split(":").slice(1).join(":").trim()
    } else {
      const parts = info.split(/\s+/)
      path = parts.find((p) => /\.[a-z0-9]{1,8}$/i.test(p) && !p.startsWith("language-")) || ""
    }
    if (!path) {
      const lang = info.split(/\s+/)[0]?.toLowerCase() || "txt"
      const ext =
        lang === "javascript" || lang === "js"
          ? "js"
          : lang === "typescript" || lang === "ts"
            ? "ts"
            : lang === "python"
              ? "py"
              : lang || "txt"
      path = index === 1 ? `index.${ext}` : `file_${index}.${ext}`
    }
    const safe = projectFileZipPath({ name: path, content: body })
    if (safe) out.push({ path: safe, content: body })
    index += 1
  }
  return out
}

export function collectProjectExportFiles(options: {
  html?: string
  htmlFilename?: string
  files?: ProjectExportFile[]
  codeFiles?: CodeFile[]
  taskResult?: unknown
  markdown?: string
}): ProjectExportFile[] {
  const collected: ProjectExportFile[] = []
  if (options.files?.length) collected.push(...options.files)
  if (options.codeFiles?.length) collected.push(...fromCodeFiles(options.codeFiles))
  if (options.taskResult) {
    collected.push(...fromCodeFiles(extractCodeFromResult(options.taskResult).files))
  }
  if (options.markdown) collected.push(...filesFromMarkdownFences(options.markdown))

  const html = options.html?.trim()
  const htmlName = options.htmlFilename?.trim() || "index.html"
  const htmlPath = html
    ? projectFileZipPath({ name: htmlName, content: html }) || "index.html"
    : undefined
  if (html && htmlPath) {
    collected.push({ path: htmlPath, content: html })
  }

  return dedupeEquivalentHtmlFiles(uniqueProjectFiles(collected), htmlPath)
}
