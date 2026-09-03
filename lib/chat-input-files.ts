type FileLikeItem = {
  kind: string
  getAsFile(): File | null
}

type FileTransferPayload = {
  files?: ArrayLike<File> | null
  items?: ArrayLike<FileLikeItem> | null
}

export function extractFilesFromDataTransfer(dataTransfer: FileTransferPayload | null | undefined): File[] {
  if (!dataTransfer) return []

  const directFiles = Array.from(dataTransfer.files ?? []).filter(
    (file): file is File => file instanceof File && file.size > 0
  )
  if (directFiles.length > 0) {
    return directFiles
  }

  return Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file instanceof File && file.size > 0)
}

export function hasFilesInDataTransfer(dataTransfer: FileTransferPayload | null | undefined): boolean {
  return extractFilesFromDataTransfer(dataTransfer).length > 0
}
