import type { PresentationArtifact } from "@/components/chat/chat-presentation-artifact"

export interface ZipMessageFields {
  title?: string
  filename?: string
  artifacts: PresentationArtifact[]
}

export function resolveZipForMessage(
  metadata?: Record<string, unknown>
): ZipMessageFields | null {
  const rawArtifacts = metadata?.zip_artifacts
  if (!Array.isArray(rawArtifacts) || !rawArtifacts.length) return null

  const artifacts: PresentationArtifact[] = []
  for (const item of rawArtifacts) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const filename = String(row.filename || "").trim()
    const mime_type = String(row.mime_type || "").trim()
    const base64 = String(row.base64 || "").trim()
    if (filename && mime_type && base64) {
      artifacts.push({
        filename,
        mime_type,
        base64,
        size_bytes:
          typeof row.size_bytes === "number" && Number.isFinite(row.size_bytes)
            ? row.size_bytes
            : undefined,
      })
    }
  }
  if (!artifacts.length) return null

  return {
    title: typeof metadata?.zip_title === "string" ? metadata.zip_title : undefined,
    filename:
      typeof metadata?.zip_filename === "string" ? metadata.zip_filename : undefined,
    artifacts,
  }
}
