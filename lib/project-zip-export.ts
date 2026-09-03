/** Sanitize project file paths and download a real ZIP in the browser. */

export interface ProjectExportFile {
  path: string
  content: string
}

export function slugifyZipBasename(name: string): string {
  const compact = (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return compact || "project"
}

/** Relative path only. Rejects absolute paths and `..` traversal. */
export function sanitizeProjectRelativePath(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null
  let path = raw.replace(/\\/g, "/").trim()
  if (!path) return null
  if (path.includes("\0")) return null
  if (/^[a-zA-Z]:/.test(path) || path.startsWith("/") || path.startsWith("//")) return null
  const parts: string[] = []
  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue
    if (segment === "..") return null
    if (/^[.]{2,}$/.test(segment)) return null
    parts.push(segment)
  }
  if (parts.length === 0) return null
  return parts.join("/")
}

export function projectFileZipPath(file: { name: string; path?: string; content: string }): string | null {
  const name = (file.name || "").replace(/\\/g, "/")
  const dir = (file.path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")
  const combined = name.includes("/") ? name.replace(/^\/+/, "") : dir ? `${dir}/${name.replace(/^\/+/, "")}` : name
  return sanitizeProjectRelativePath(combined)
}

export function uniqueProjectFiles(files: ProjectExportFile[]): ProjectExportFile[] {
  const byPath = new Map<string, ProjectExportFile>()
  for (const file of files) {
    const path = sanitizeProjectRelativePath(file.path)
    if (!path) continue
    const content = typeof file.content === "string" ? file.content : ""
    const prev = byPath.get(path)
    if (!prev || content.length > prev.content.length) {
      byPath.set(path, { path, content })
    }
  }
  return Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path))
}

export type ZipExportProgress =
  | "preparing"
  | "creating"
  | "compressing"
  | "downloading"
  | "done"
  | "error"

export function zipProgressLabel(step: ZipExportProgress): string {
  switch (step) {
    case "preparing":
      return "Preparing files..."
    case "creating":
      return "Creating archive..."
    case "compressing":
      return "Compressing..."
    case "downloading":
      return "Downloading..."
    case "done":
      return "Downloaded"
    case "error":
      return "Couldn't create the ZIP. Please try again."
  }
}

export async function downloadProjectZip(options: {
  name: string
  files: ProjectExportFile[]
  onProgress?: (step: ZipExportProgress, percent?: number) => void
}): Promise<{ filename: string; fileCount: number }> {
  const files = uniqueProjectFiles(options.files)
  if (files.length === 0) {
    throw new Error("No project files to package")
  }

  const root = slugifyZipBasename(options.name)
  const filename = `${root}.zip`
  options.onProgress?.("preparing")

  const JSZip = (await import("jszip")).default
  const zip = new JSZip()
  const folder = zip.folder(root)
  if (!folder) {
    throw new Error("Couldn't create the ZIP. Please try again.")
  }

  options.onProgress?.("creating")
  for (const file of files) {
    folder.file(file.path, file.content, { binary: false })
  }

  options.onProgress?.("compressing", 0)
  const blob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (meta) => {
      options.onProgress?.("compressing", meta.percent)
    }
  )

  options.onProgress?.("downloading")
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  options.onProgress?.("done")
  return { filename, fileCount: files.length }
}
