import type { ChatConversation, ChatMessage, WebSearchSource } from "@/types/api"

export type ChatExportFormat = "markdown" | "text" | "json" | "pdf"

export interface ConversationExport {
  conversation: ChatConversation
  messages: ChatMessage[]
}

const ROLE_LABEL: Record<string, string> = {
  user: "You",
  assistant: "Assistant",
  tool: "Tool",
  system: "System",
}

const ROLE_EMOJI: Record<string, string> = {
  user: "🧑",
  assistant: "🤖",
  tool: "🛠️",
  system: "⚙️",
}

function roleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role.charAt(0).toUpperCase() + role.slice(1)
}

/** Format an ISO date to a readable local string; falls back to the raw value. */
export function formatExportDate(iso?: string | null): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Collect de-duplicated web-search sources referenced by a message. */
function messageSources(message: ChatMessage): WebSearchSource[] {
  const out: WebSearchSource[] = []
  const seen = new Set<string>()
  for (const event of message.tool_events ?? []) {
    for (const source of event.sources ?? []) {
      const key = source.url || source.title
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(source)
    }
  }
  return out
}

export function slugifyTitle(title: string, fallback = "conversation"): string {
  const slug = (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return slug || fallback
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

export function conversationToMarkdown(entry: ConversationExport): string {
  const { conversation, messages } = entry
  const lines: string[] = []
  lines.push(`# ${conversation.title || "Untitled conversation"}`)
  lines.push("")
  const meta: string[] = []
  meta.push(`- **Exported:** ${formatExportDate(new Date().toISOString())}`)
  if (conversation.created_at) meta.push(`- **Created:** ${formatExportDate(conversation.created_at)}`)
  if (conversation.updated_at) meta.push(`- **Last updated:** ${formatExportDate(conversation.updated_at)}`)
  if (conversation.model_id) meta.push(`- **Model:** ${conversation.model_id}`)
  meta.push(`- **Messages:** ${messages.length}`)
  lines.push(...meta)
  lines.push("")
  lines.push("---")
  lines.push("")

  for (const message of messages) {
    const emoji = ROLE_EMOJI[message.role] ?? "•"
    const stamp = formatExportDate(message.created_at)
    lines.push(`### ${emoji} ${roleLabel(message.role)}${stamp ? ` · ${stamp}` : ""}`)
    lines.push("")
    lines.push((message.content || "").trim() || "_(no text content)_")
    lines.push("")

    const attachments = message.attachments ?? []
    if (attachments.length > 0) {
      lines.push(`**Attachments:** ${attachments.map((a) => a.filename).join(", ")}`)
      lines.push("")
    }

    const sources = messageSources(message)
    if (sources.length > 0) {
      lines.push("**Sources:**")
      sources.forEach((source, i) => {
        const label = source.title || source.url
        const suffix = source.source ? ` — ${source.source}` : ""
        lines.push(`${i + 1}. [${label}](${source.url})${suffix}`)
      })
      lines.push("")
    }

    lines.push("---")
    lines.push("")
  }

  return lines.join("\n").trimEnd() + "\n"
}

export function conversationsToMarkdown(entries: ConversationExport[]): string {
  if (entries.length === 1) return conversationToMarkdown(entries[0])
  const header = [
    `# Chat export`,
    "",
    `- **Exported:** ${formatExportDate(new Date().toISOString())}`,
    `- **Conversations:** ${entries.length}`,
    "",
    "---",
    "",
  ].join("\n")
  return header + entries.map(conversationToMarkdown).join("\n\n")
}

/* ------------------------------------------------------------------ */
/* Plain text                                                          */
/* ------------------------------------------------------------------ */

export function conversationToPlainText(entry: ConversationExport): string {
  const { conversation, messages } = entry
  const lines: string[] = []
  lines.push((conversation.title || "Untitled conversation").toUpperCase())
  lines.push("=".repeat(Math.min((conversation.title || "Untitled conversation").length, 60)))
  lines.push(`Exported: ${formatExportDate(new Date().toISOString())}`)
  if (conversation.created_at) lines.push(`Created: ${formatExportDate(conversation.created_at)}`)
  if (conversation.updated_at) lines.push(`Last updated: ${formatExportDate(conversation.updated_at)}`)
  if (conversation.model_id) lines.push(`Model: ${conversation.model_id}`)
  lines.push(`Messages: ${messages.length}`)
  lines.push("")

  for (const message of messages) {
    const stamp = formatExportDate(message.created_at)
    lines.push(`[${roleLabel(message.role)}${stamp ? ` · ${stamp}` : ""}]`)
    lines.push((message.content || "").trim() || "(no text content)")
    const attachments = message.attachments ?? []
    if (attachments.length > 0) {
      lines.push(`Attachments: ${attachments.map((a) => a.filename).join(", ")}`)
    }
    const sources = messageSources(message)
    if (sources.length > 0) {
      lines.push("Sources:")
      sources.forEach((source, i) => {
        lines.push(`  ${i + 1}. ${source.title || source.url} — ${source.url}`)
      })
    }
    lines.push("")
    lines.push("-".repeat(48))
    lines.push("")
  }

  return lines.join("\n").trimEnd() + "\n"
}

export function conversationsToPlainText(entries: ConversationExport[]): string {
  return entries.map(conversationToPlainText).join("\n\n")
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

export function conversationsToJson(entries: ConversationExport[]): string {
  const payload = {
    exported_at: new Date().toISOString(),
    conversation_count: entries.length,
    conversations: entries.map(({ conversation, messages }) => ({
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      model_id: conversation.model_id ?? null,
      thinking_mode: conversation.thinking_mode ?? null,
      messages: messages.map((m) => ({
        message_id: m.message_id,
        role: m.role,
        content: m.content,
        created_at: m.created_at,
        attachments: (m.attachments ?? []).map((a) => ({
          filename: a.filename,
          mime_type: a.mime_type,
          size_bytes: a.size_bytes,
        })),
        sources: messageSources(m),
      })),
    })),
  }
  return JSON.stringify(payload, null, 2)
}

/* ------------------------------------------------------------------ */
/* Printable HTML (for PDF via the browser print dialog)              */
/* ------------------------------------------------------------------ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function messageToHtml(message: ChatMessage): string {
  const stamp = formatExportDate(message.created_at)
  const content = escapeHtml((message.content || "").trim() || "(no text content)").replace(
    /\n/g,
    "<br>"
  )
  const sources = messageSources(message)
  const sourcesHtml =
    sources.length > 0
      ? `<div class="sources"><span class="sources-label">Sources</span><ol>${sources
          .map(
            (s) =>
              `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.title || s.url)}</a>${
                s.source ? ` <span class="src">— ${escapeHtml(s.source)}</span>` : ""
              }</li>`
          )
          .join("")}</ol></div>`
      : ""
  const attachments = message.attachments ?? []
  const attachmentsHtml =
    attachments.length > 0
      ? `<div class="attachments">📎 ${attachments.map((a) => escapeHtml(a.filename)).join(", ")}</div>`
      : ""
  return `<div class="msg msg-${escapeHtml(message.role)}">
    <div class="msg-head"><span class="role">${escapeHtml(roleLabel(message.role))}</span>${
      stamp ? `<span class="stamp">${escapeHtml(stamp)}</span>` : ""
    }</div>
    <div class="msg-body">${content}</div>
    ${attachmentsHtml}
    ${sourcesHtml}
  </div>`
}

function conversationToHtmlSection(entry: ConversationExport): string {
  const { conversation, messages } = entry
  const meta = [
    conversation.created_at ? `Created ${formatExportDate(conversation.created_at)}` : "",
    conversation.updated_at ? `Updated ${formatExportDate(conversation.updated_at)}` : "",
    conversation.model_id ? `Model ${conversation.model_id}` : "",
    `${messages.length} messages`,
  ]
    .filter(Boolean)
    .join(" · ")
  return `<section class="conversation">
    <h1>${escapeHtml(conversation.title || "Untitled conversation")}</h1>
    <p class="meta">${escapeHtml(meta)}</p>
    ${messages.map(messageToHtml).join("\n")}
  </section>`
}

export function conversationsToPrintHtml(entries: ConversationExport[]): string {
  const title =
    entries.length === 1 ? entries[0].conversation.title || "Conversation" : "Chat export"
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #14141b; background: #fff; margin: 0; padding: 32px;
    line-height: 1.6; font-size: 14px;
  }
  .export-head { margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #ececf2; }
  .export-head .brand { font-weight: 700; letter-spacing: -0.01em; color: #0a0a14; }
  .export-head .sub { color: #6b6b78; font-size: 12px; margin-top: 2px; }
  .conversation { margin-bottom: 40px; page-break-after: always; }
  .conversation:last-child { page-break-after: auto; }
  h1 { font-size: 20px; margin: 0 0 4px; color: #0a0a14; }
  .meta { color: #6b6b78; font-size: 12px; margin: 0 0 20px; }
  .msg { padding: 12px 14px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #ececf2; page-break-inside: avoid; }
  .msg-user { background: #f6f7f9; }
  .msg-assistant { background: #fffaf2; border-color: #f3e4c9; }
  .msg-tool { background: #f2f7ff; border-color: #d9e6fb; }
  .msg-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
  .role { font-weight: 600; color: #0a0a14; }
  .stamp { font-size: 11px; color: #8a8a96; }
  .msg-body { white-space: normal; word-wrap: break-word; }
  .attachments { margin-top: 8px; font-size: 12px; color: #6b6b78; }
  .sources { margin-top: 10px; font-size: 12px; }
  .sources-label { display: block; font-weight: 600; color: #6b6b78; margin-bottom: 2px; }
  .sources ol { margin: 0; padding-left: 18px; }
  .sources a { color: #b45309; text-decoration: none; word-break: break-all; }
  .src { color: #8a8a96; }
  @media print {
    body { padding: 0; }
    .msg-assistant { background: #fffaf2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="export-head">
    <div class="brand">MasterNode · Chat export</div>
    <div class="sub">Exported ${escapeHtml(formatExportDate(new Date().toISOString()))} · ${
      entries.length
    } conversation${entries.length === 1 ? "" : "s"}</div>
  </div>
  ${entries.map(conversationToHtmlSection).join("\n")}
</body>
</html>`
}

/* ------------------------------------------------------------------ */
/* Download / print helpers                                            */
/* ------------------------------------------------------------------ */

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Open the print dialog with a self-contained HTML document (user picks "Save as PDF"). */
export function printHtmlDocument(html: string): boolean {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000")
  if (!printWindow) return false
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  // Give the new document a tick to lay out before invoking print.
  window.setTimeout(() => {
    try {
      printWindow.print()
    } catch {
      /* user can print manually */
    }
  }, 350)
  return true
}

export const EXPORT_FORMAT_META: Record<
  ChatExportFormat,
  { label: string; extension: string; mime: string }
> = {
  markdown: { label: "Markdown (.md)", extension: "md", mime: "text/markdown" },
  text: { label: "Plain text (.txt)", extension: "txt", mime: "text/plain" },
  json: { label: "JSON (.json)", extension: "json", mime: "application/json" },
  pdf: { label: "PDF (print dialog)", extension: "pdf", mime: "application/pdf" },
}

/**
 * Build + trigger the export for the chosen format. Returns a short status
 * string for UI feedback. PDF opens the browser print dialog instead of a file.
 */
export function runChatExport(
  entries: ConversationExport[],
  format: ChatExportFormat
): { ok: boolean; message: string } {
  if (entries.length === 0) {
    return { ok: false, message: "No conversations to export." }
  }

  const base =
    entries.length === 1
      ? slugifyTitle(entries[0].conversation.title)
      : `masternode-chats-${new Date().toISOString().slice(0, 10)}`

  if (format === "pdf") {
    const opened = printHtmlDocument(conversationsToPrintHtml(entries))
    return opened
      ? { ok: true, message: "Opened the print dialog — choose “Save as PDF”." }
      : { ok: false, message: "Pop-up blocked. Allow pop-ups, then try again." }
  }

  if (format === "markdown") {
    downloadTextFile(`${base}.md`, conversationsToMarkdown(entries), "text/markdown")
    return { ok: true, message: "Markdown downloaded." }
  }
  if (format === "text") {
    downloadTextFile(`${base}.txt`, conversationsToPlainText(entries), "text/plain")
    return { ok: true, message: "Text file downloaded." }
  }
  downloadTextFile(`${base}.json`, conversationsToJson(entries), "application/json")
  return { ok: true, message: "JSON downloaded." }
}
