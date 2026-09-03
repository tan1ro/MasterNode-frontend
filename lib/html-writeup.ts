import { extractCodeFromResult } from "@/lib/task-result-parser"

export interface HtmlWriteupFields {
  html: string
  title?: string
  filename?: string
}

const HTML_WRITEUP_MIN_LEN = 120

export function isHtmlWriteupFragment(html: string): boolean {
  const t = html.trim()
  if (t.length < HTML_WRITEUP_MIN_LEN) return false
  if (!/<[a-z][\s\S]*>/i.test(t)) return false
  return /<style[\s>]/i.test(t) || /<div[\s>]/i.test(t) || /<h1[\s>]/i.test(t)
}

/** Whether a fenced code block is rich enough to open in the side visualization panel. */
export function canOpenHtmlVisualization(code: string, languageId?: string): boolean {
  const lang = (languageId || "").toLowerCase()
  const t = (code || "").trim()
  if (!t || !/<[a-z][\s\S]*>/i.test(t)) return false
  if (lang === "html" || lang === "svg" || lang === "xml") return t.length >= 40
  return isHtmlWriteupFragment(t)
}

export function wrapHtmlWriteupDocument(fragment: string): string {
  const body = fragment.trim()
  if (/^<!DOCTYPE\s+html/i.test(body) || /^<html[\s>]/i.test(body)) {
    return body
  }
  const hasFontImport = /@import\s+url\(/i.test(body)
  const fontLink = hasFontImport
    ? ""
    : `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap">`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${fontLink}
<style>html,body{margin:0;padding:0;background:transparent;}</style>
</head>
<body>${body}</body>
</html>`
}

function titleFromHtml(html: string): string {
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  if (titleTag) return titleTag.slice(0, 80)
  const h1 = html
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (h1) return h1.slice(0, 80)
  return "Webpage"
}

function slugifyHtmlFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, "")
  return `${slug || "webpage"}.html`
}

interface MdFence {
  lang: string
  body: string
  full: string
}

function listMarkdownFences(content: string): MdFence[] {
  const fences: MdFence[] = []
  const re = /```([a-z0-9_+#-]*)[^\n]*\n([\s\S]*?)```/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(content))) {
    fences.push({
      lang: (match[1] || "").toLowerCase(),
      body: (match[2] || "").replace(/\n$/, ""),
      full: match[0],
    })
  }
  return fences
}

function isHtmlFence(fence: MdFence): boolean {
  const lang = fence.lang
  const t = fence.body.trim()
  if (!t) return false
  if (lang === "html" || lang === "htm" || lang === "svg") {
    return t.length >= 24 && /<[a-z][\s\S]*>/i.test(t)
  }
  if (lang && lang !== "xml" && lang !== "text" && lang !== "plaintext") return false
  return (
    /^<!DOCTYPE\s+html/i.test(t) ||
    /^<html[\s>]/i.test(t) ||
    (t.length >= 80 && /<(style|div|section|header|main|nav|h1)[\s>]/i.test(t))
  )
}

/**
 * Pull a downloadable webpage out of assistant markdown (```html fences, optional css/js).
 * Used so chat shows a compact card + side preview instead of a huge inline code dump.
 */
export function extractWebPageArtifactFromMarkdown(
  content: string
): (HtmlWriteupFields & { fenceBodies: string[] }) | null {
  const fences = listMarkdownFences(content)
  if (fences.length === 0) return null

  const htmlFence = [...fences].reverse().find(isHtmlFence)
  if (!htmlFence) return null

  const cssParts = fences
    .filter((f) => f.lang === "css" || f.lang === "scss")
    .map((f) => f.body.trim())
    .filter(Boolean)
  const jsParts = fences
    .filter((f) => f.lang === "js" || f.lang === "javascript")
    .map((f) => f.body.trim())
    .filter(Boolean)

  let html = htmlFence.body.trim()
  const usedBodies = [htmlFence.body, ...cssParts, ...jsParts]

  // Merge sibling CSS/JS fences into a complete document when the HTML is a fragment or incomplete.
  if (cssParts.length || jsParts.length) {
    const styleBlock = cssParts.length ? `<style>\n${cssParts.join("\n\n")}\n</style>` : ""
    const scriptBlock = jsParts.length
      ? `<script>\n${jsParts.join("\n\n")}\n</script>`
      : ""
    if (/^<!DOCTYPE\s+html/i.test(html) || /^<html[\s>]/i.test(html)) {
      if (styleBlock && !/<style[\s>]/i.test(html)) {
        html = html.replace(/<\/head>/i, `${styleBlock}\n</head>`)
        if (!/<\/head>/i.test(html)) html = `${styleBlock}\n${html}`
      }
      if (scriptBlock && !/<script[\s>]/i.test(html)) {
        html = html.replace(/<\/body>/i, `${scriptBlock}\n</body>`)
        if (!/<\/body>/i.test(html)) html = `${html}\n${scriptBlock}`
      }
    } else {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleFromHtml(html)}</title>
${styleBlock}
</head>
<body>
${html}
${scriptBlock}
</body>
</html>`
    }
  }

  if (!canOpenHtmlVisualization(html, "html") && !/^<!DOCTYPE\s+html/i.test(html) && !/^<html[\s>]/i.test(html)) {
    // Allow merged multi-fence pages that are still modest in size.
    if (!/<[a-z][\s\S]*>/i.test(html) || html.trim().length < 24) return null
  }

  const title = titleFromHtml(html)
  return {
    html,
    title,
    filename: slugifyHtmlFilename(title),
    fenceBodies: usedBodies,
  }
}

/** Remove extracted webdev fences from chat markdown so the thread stays clean. */
export function stripWebPageFencesFromMarkdown(
  content: string,
  fenceBodies: string[]
): string {
  if (!content.trim() || fenceBodies.length === 0) return content
  let out = content
  for (const body of fenceBodies) {
    const escaped = body.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out.replace(
      new RegExp("```[^\\n]*\\n" + escaped + "\\n?```", "g"),
      ""
    )
  }
  return out.replace(/\n{3,}/g, "\n\n").trim()
}


function pickHtmlFromRecord(record: Record<string, unknown>): string | null {
  const direct = record.html_writeup
  if (typeof direct === "string" && isHtmlWriteupFragment(direct)) return direct.trim()

  const fr = record.final_result
  if (typeof fr === "string" && isHtmlWriteupFragment(fr)) return fr.trim()
  if (fr && typeof fr === "object" && !Array.isArray(fr)) {
    const inner = fr as Record<string, unknown>
    const nested = inner.html_writeup
    if (typeof nested === "string" && isHtmlWriteupFragment(nested)) return nested.trim()
    const nestedFr = inner.final_result
    if (typeof nestedFr === "string" && isHtmlWriteupFragment(nestedFr)) return nestedFr.trim()
    for (const [path, content] of Object.entries(inner)) {
      if (typeof content !== "string") continue
      if (/\.html?$/i.test(path) && isHtmlWriteupFragment(content)) return content.trim()
    }
  }
  return null
}

export function extractHtmlWriteupFromTaskResult(result: unknown): HtmlWriteupFields | null {
  if (!result || typeof result !== "object") return null
  const record = result as Record<string, unknown>
  const html = pickHtmlFromRecord(record)
  if (!html) {
    const extracted = extractCodeFromResult(record)
    for (const file of extracted.files) {
      if (!/\.html?$/i.test(file.name)) continue
      if (isHtmlWriteupFragment(file.content)) {
        return {
          html: file.content.trim(),
          title:
            typeof record.html_writeup_title === "string"
              ? record.html_writeup_title
              : typeof record.document_title === "string"
                ? record.document_title
                : file.name.replace(/\.html?$/i, ""),
          filename: file.name,
        }
      }
    }
    return null
  }

  const title =
    typeof record.html_writeup_title === "string"
      ? record.html_writeup_title
      : typeof record.document_title === "string"
        ? record.document_title
        : undefined
  const filename =
    typeof record.html_writeup_filename === "string"
      ? record.html_writeup_filename
      : undefined
  return { html, title, filename }
}

export function resolveHtmlWriteupForMessage(
  metadata?: Record<string, unknown>
): HtmlWriteupFields | null {
  const direct =
    typeof metadata?.html_writeup === "string" && isHtmlWriteupFragment(metadata.html_writeup)
      ? metadata.html_writeup.trim()
      : null
  if (direct) {
    return {
      html: direct,
      title:
        typeof metadata?.html_writeup_title === "string"
          ? metadata.html_writeup_title
          : undefined,
      filename:
        typeof metadata?.html_writeup_filename === "string"
          ? metadata.html_writeup_filename
          : undefined,
    }
  }
  return extractHtmlWriteupFromTaskResult(metadata?.task_result)
}

export function downloadHtmlWriteup(html: string, filename: string): void {
  const doc = wrapHtmlWriteupDocument(html)
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename.endsWith(".html") ? filename : `${filename}.html`
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function openHtmlWriteupInNewTab(html: string): void {
  const doc = wrapHtmlWriteupDocument(html)
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
