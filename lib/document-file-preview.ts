import JSZip from "jszip"
import mammoth from "mammoth"
import { attachmentKindFromFile } from "@/lib/chat-composer-attachments"

export type DocumentFilePreview =
  | { type: "html"; html: string }
  | { type: "text"; text: string }
  | { type: "slides"; slides: Array<{ index: number; lines: string[] }> }
  | { type: "unsupported"; reason: string }

const OOXML_TEXT_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"

export function extractOoxmlTextNodes(xml: string): string[] {
  const lines: string[] = []
  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(xml, "application/xml")
      const nodes = doc.getElementsByTagNameNS(OOXML_TEXT_NS, "t")
      for (let i = 0; i < nodes.length; i += 1) {
        const text = nodes[i].textContent?.trim()
        if (text) lines.push(text)
      }
    } catch {
      // Regex fallback below.
    }
  }
  if (lines.length > 0) return lines

  const re = /<(?:[a-zA-Z0-9]+:)?t(?:\s[^>]*)?>([^<]*)<\/(?:[a-zA-Z0-9]+:)?t>/g
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) {
    const text = match[1]?.trim()
    if (text) lines.push(text)
  }
  return lines
}

async function readFileBytes(file: Blob): Promise<ArrayBuffer> {
  if (typeof (file as File).arrayBuffer === "function") {
    return (file as File).arrayBuffer()
  }
  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result)
      else reject(new Error("Could not read file bytes."))
    }
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file bytes."))
    reader.readAsArrayBuffer(file)
  })
}

async function previewDocx(file: File): Promise<DocumentFilePreview> {
  const name = file.name.toLowerCase()
  if (name.endsWith(".doc") && !name.endsWith(".docx")) {
    return {
      type: "unsupported",
      reason: "Legacy .doc files cannot be previewed inline. Download to open in Word.",
    }
  }
  const arrayBuffer = await readFileBytes(file)
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const html = result.value.trim()
  if (!html) {
    return { type: "unsupported", reason: "This document has no readable text to preview." }
  }
  return { type: "html", html }
}

async function previewPptx(file: File): Promise<DocumentFilePreview> {
  const zip = await JSZip.loadAsync(await readFileBytes(file))
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] || 0)
      const nb = Number(b.match(/slide(\d+)/i)?.[1] || 0)
      return na - nb
    })

  if (slidePaths.length === 0) {
    return { type: "unsupported", reason: "No slides found in this presentation." }
  }

  const slides: Array<{ index: number; lines: string[] }> = []
  for (let i = 0; i < slidePaths.length; i += 1) {
    const entry = zip.file(slidePaths[i])
    if (!entry) continue
    const xml = await entry.async("string")
    const lines = extractOoxmlTextNodes(xml)
    slides.push({ index: i + 1, lines })
  }

  if (slides.every((slide) => slide.lines.length === 0)) {
    return {
      type: "unsupported",
      reason: "This presentation has no extractable text (images-only slides).",
    }
  }

  return { type: "slides", slides }
}

async function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    try {
      return await file.text()
    } catch {
      // Fall back to FileReader below.
    }
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file text."))
    reader.readAsText(file)
  })
}

async function previewText(file: File): Promise<DocumentFilePreview> {
  const text = await readFileAsText(file)
  return { type: "text", text: text.trim() || "(Empty file)" }
}

export async function buildDocumentFilePreview(file: File): Promise<DocumentFilePreview> {
  const kind = attachmentKindFromFile(file)
  const name = file.name.toLowerCase()

  try {
    if (kind === "document") {
      if (name.endsWith(".txt") || name.endsWith(".md") || (file.type || "").startsWith("text/")) {
        return await previewText(file)
      }
      return await previewDocx(file)
    }
    if (kind === "presentation") {
      if (name.endsWith(".ppt") && !name.endsWith(".pptx")) {
        return {
          type: "unsupported",
          reason: "Legacy .ppt files cannot be previewed inline. Download to open in PowerPoint.",
        }
      }
      return await previewPptx(file)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read this file."
    return { type: "unsupported", reason: message }
  }

  return { type: "unsupported", reason: "Preview is not available for this file type." }
}

export function canBuildDocumentPreview(file: File): boolean {
  const kind = attachmentKindFromFile(file)
  return kind === "document" || kind === "presentation"
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/** Parse slide text from an in-memory PPTX (e.g. chat presentation artifact). */
export async function previewPptxFromBase64(base64: string): Promise<DocumentFilePreview> {
  const zip = await JSZip.loadAsync(base64ToArrayBuffer(base64))
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] || 0)
      const nb = Number(b.match(/slide(\d+)/i)?.[1] || 0)
      return na - nb
    })

  if (slidePaths.length === 0) {
    return { type: "unsupported", reason: "No slides found in this presentation." }
  }

  const slides: Array<{ index: number; lines: string[] }> = []
  for (let i = 0; i < slidePaths.length; i += 1) {
    const entry = zip.file(slidePaths[i])
    if (!entry) continue
    const xml = await entry.async("string")
    slides.push({ index: i + 1, lines: extractOoxmlTextNodes(xml) })
  }

  if (slides.every((slide) => slide.lines.length === 0)) {
    return {
      type: "unsupported",
      reason: "This presentation has no extractable text (images-only slides).",
    }
  }

  return { type: "slides", slides }
}
