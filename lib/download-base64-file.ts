export interface Base64FilePayload {
  filename: string
  mime_type?: string
  base64: string
}

export function normalizeBase64Payload(raw: string): string {
  let value = (raw || "").trim()
  const dataUri = /^data:[^;]+;base64,(.+)$/i.exec(value)
  if (dataUri?.[1]) {
    value = dataUri[1]
  }
  return value.replace(/\s/g, "")
}

/** Trigger a browser download from a base64-encoded file payload. */
export function downloadBase64File(
  payload: string | Base64FilePayload,
  filename?: string,
  mimeType = "application/octet-stream"
): void {
  let base64: string
  let downloadName: string
  let downloadMime: string

  if (typeof payload === "object" && payload !== null && "base64" in payload) {
    base64 = payload.base64
    downloadName = payload.filename || filename || "download"
    downloadMime = payload.mime_type || mimeType
  } else {
    base64 = payload
    downloadName = filename || "download"
    downloadMime = mimeType
  }

  const normalized = normalizeBase64Payload(base64)
  if (!normalized) {
    throw new Error("Empty file payload")
  }

  let binary: string
  try {
    binary = atob(normalized)
  } catch {
    throw new Error("File data is not valid base64")
  }

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: downloadMime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = downloadName
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
