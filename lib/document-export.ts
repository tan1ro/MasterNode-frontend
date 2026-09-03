import { chatService } from "@/services/chat"
import { downloadBase64File } from "@/lib/download-base64-file"

export function slugifyDocumentFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, "")
  return slug || "document"
}

export async function exportMarkdownAsDocument(options: {
  title: string
  markdown: string
  format: "docx" | "pdf"
  baseFilename?: string
}): Promise<void> {
  const baseFilename = options.baseFilename ?? slugifyDocumentFilename(options.title)
  const docs = await chatService.generateAcademicCourseDocuments({
    title: options.title,
    content: options.markdown,
    base_filename: baseFilename,
    formats: [options.format],
  })
  const extension = options.format === "docx" ? ".docx" : ".pdf"
  const artifact = docs.artifacts.find((a) => a.filename.toLowerCase().endsWith(extension))
  if (!artifact) {
    throw new Error(`No ${options.format.toUpperCase()} file returned`)
  }
  downloadBase64File({
    ...artifact,
    filename: `${baseFilename}${extension}`,
    mime_type:
      artifact.mime_type ||
      (options.format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf"),
  })
}
