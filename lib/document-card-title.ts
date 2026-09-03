/** First markdown heading for document card chrome. */
export function extractDocumentCardTitle(markdown: string, fallback = "Document"): string {
  const text = (markdown || "").trim()
  if (!text) return fallback
  const h1 = text.match(/^#\s+(.+)$/m)
  if (h1?.[1]) return h1[1].trim().replace(/\*\*/g, "")
  const h2 = text.match(/^##\s+(.+)$/m)
  if (h2?.[1]) return h2[1].trim().replace(/\*\*/g, "")
  const firstLine = text.split("\n").find((line) => line.trim())
  if (firstLine && firstLine.length <= 80) {
    return firstLine.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim()
  }
  return fallback
}
