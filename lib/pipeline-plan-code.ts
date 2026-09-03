/**
 * Helpers for code / frontend pipeline plan presentation.
 */

import type { ParsedPlanView } from "@/lib/pipeline-plan-parse"

export interface PlanFileTreeNode {
  path: string
  name: string
  kind: "file" | "folder"
  extension?: string
}

const CODE_EXTENSIONS = new Set([
  "html",
  "htm",
  "css",
  "scss",
  "sass",
  "less",
  "js",
  "jsx",
  "ts",
  "tsx",
  "vue",
  "svelte",
  "json",
  "yaml",
  "yml",
  "toml",
  "md",
  "svg",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gitignore",
])

const CODE_DELIVERABLE_HINTS =
  /\b(html|css|javascript|typescript|react|vue|svelte|next\.?js|vite|webpack|frontend|component|api|script\.js|index\.html|portfolio\s+website|web\s+site|webpage)\b/i

export function isCodePipelinePlan(
  intentKind: string | undefined,
  parsed: Pick<ParsedPlanView, "deliverables" | "title" | "overview">
): boolean {
  if (intentKind === "code") return true
  const blob = [
    parsed.title,
    parsed.overview,
    ...parsed.deliverables,
  ]
    .join(" ")
    .toLowerCase()
  if (CODE_DELIVERABLE_HINTS.test(blob)) return true
  return parsed.deliverables.some((d) => /\.(html?|css|jsx?|tsx?|vue|svelte)\b/i.test(d))
}

function extensionFromPath(path: string): string | undefined {
  const base = path.split("/").pop() || path
  if (base.startsWith(".")) return base.slice(1) || undefined
  const dot = base.lastIndexOf(".")
  if (dot <= 0) return undefined
  return base.slice(dot + 1).toLowerCase()
}

function extractPathFromDeliverableLine(line: string): string | null {
  const trimmed = line.trim()
  const backtick = trimmed.match(/`([^`]+)`/)
  if (backtick?.[1]) return backtick[1].replace(/^\/+/, "")
  const plain = trimmed.match(
    /(?:^|\s)((?:[\w.-]+\/)*[\w.-]+\.(?:html?|css|jsx?|tsx?|vue|svelte|json|ya?ml|toml|md|svg|png|jpe?g|webp))(?:\s|:|$)/i
  )
  if (plain?.[1]) return plain[1].replace(/^\/+/, "")
  if (/^[\w.-]+\/[\w./-]+$/.test(trimmed.split(":")[0]?.trim() || "")) {
    return trimmed.split(":")[0].trim()
  }
  return null
}

export function parseDeliverableFileTree(deliverables: string[]): PlanFileTreeNode[] {
  const paths = new Set<string>()
  for (const line of deliverables) {
    const path = extractPathFromDeliverableLine(line)
    if (path) paths.add(path)
  }

  const nodes: PlanFileTreeNode[] = []
  for (const path of [...paths].sort()) {
    const parts = path.split("/").filter(Boolean)
    if (parts.length === 0) continue
    if (parts.length > 1 && parts[parts.length - 1] === "") continue

    const name = parts[parts.length - 1]
    const ext = extensionFromPath(name)
    const isFolder = !ext || (parts.length > 1 && !name.includes("."))

    if (isFolder && !name.includes(".")) {
      nodes.push({ path, name, kind: "folder" })
      continue
    }
    if (ext && (CODE_EXTENSIONS.has(ext) || ext.length <= 5)) {
      nodes.push({ path, name, kind: "file", extension: ext })
    }
  }

  if (nodes.length > 0) return nodes

  return deliverables
    .filter((d) => /\.(html?|css|jsx?|tsx?|vue|svelte|json|md)\b/i.test(d))
    .slice(0, 8)
    .map((line) => {
      const path = extractPathFromDeliverableLine(line) || line.slice(0, 48)
      const name = path.split("/").pop() || path
      return {
        path,
        name,
        kind: "file" as const,
        extension: extensionFromPath(name),
      }
    })
}

export function inferProjectFolderName(title: string, taskId?: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
  if (slug) return slug
  const suffix = (taskId || "").replace(/^api-/, "").slice(0, 8)
  return suffix ? `project-${suffix}` : "project"
}

export function fileIconTone(extension?: string): string {
  switch (extension) {
    case "html":
    case "htm":
      return "text-orange-400"
    case "css":
    case "scss":
    case "sass":
    case "less":
      return "text-sky-400"
    case "js":
    case "jsx":
      return "text-amber-300"
    case "ts":
    case "tsx":
      return "text-blue-400"
    case "vue":
      return "text-emerald-400"
    case "svelte":
      return "text-orange-500"
    case "json":
    case "yaml":
    case "yml":
    case "toml":
      return "text-violet-400"
    case "md":
      return "text-muted-foreground"
    default:
      return "text-muted-foreground"
  }
}
