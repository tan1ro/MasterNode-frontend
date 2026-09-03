type FileLikeItem = {
  kind: string
  getAsFile(): File | null
}

type FileTransferPayload = {
  files?: ArrayLike<File> | null
  items?: ArrayLike<FileLikeItem> | null
}

type ClipboardTextPayload = {
  getData(type: string): string
  types?: readonly string[] | string[]
}

function isImageOrFileMime(mime: string): boolean {
  const type = mime.toLowerCase()
  return type.startsWith("image/") || type === "application/pdf" || type.length > 0
}

export function extractFilesFromDataTransfer(
  dataTransfer: FileTransferPayload | null | undefined
): File[] {
  if (!dataTransfer) return []

  const directFiles = Array.from(dataTransfer.files ?? []).filter(
    (file): file is File =>
      file instanceof File && file.size > 0 && isImageOrFileMime(file.type || "")
  )
  if (directFiles.length > 0) {
    return directFiles
  }

  return Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter(
      (file): file is File =>
        file instanceof File && file.size > 0 && isImageOrFileMime(file.type || "")
    )
}

export function hasFilesInDataTransfer(
  dataTransfer: FileTransferPayload | null | undefined
): boolean {
  return extractFilesFromDataTransfer(dataTransfer).length > 0
}

export function htmlToPlainText(html: string): string {
  const source = html.trim()
  if (!source) return ""

  const withBreaks = source
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")

  if (typeof DOMParser === "undefined") {
    return withBreaks
      .replace(/<[^>]+>/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  const doc = new DOMParser().parseFromString(withBreaks, "text/html")
  return (doc.body.textContent || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function extractPasteText(clipboard: ClipboardTextPayload | null | undefined): string {
  if (!clipboard) return ""

  const plain = clipboard.getData("text/plain")
  if (plain.trim()) {
    return plain.replace(/\r\n/g, "\n")
  }

  const html = clipboard.getData("text/html")
  if (html.trim()) {
    return htmlToPlainText(html)
  }

  return ""
}

export function insertTextAtSelection(
  value: string,
  insert: string,
  selectionStart: number,
  selectionEnd: number
): { nextValue: string; cursor: number } {
  const nextValue = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`
  const cursor = selectionStart + insert.length
  return { nextValue, cursor }
}
