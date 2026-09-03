/** Parse Server-Sent Event blocks from a growing UTF-8 buffer. */

export type ChatSseHandler = (event: string, data: string) => void

function parseSseBlock(block: string, onEvent: ChatSseHandler): void {
  if (!block.trim()) return
  let eventName = ""
  const dataLines: string[] = []
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim()
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^\s/, ""))
    }
  }
  if (eventName && dataLines.length > 0) {
    onEvent(eventName, dataLines.join("\n"))
  }
}

export function consumeChatSseBuffer(buffer: string, onEvent: ChatSseHandler): string {
  const normalized = buffer.replace(/\r\n/g, "\n")
  let rest = normalized
  while (true) {
    const sep = rest.indexOf("\n\n")
    if (sep === -1) break
    const block = rest.slice(0, sep)
    rest = rest.slice(sep + 2)
    parseSseBlock(block, onEvent)
  }
  return rest
}

/** Parse any trailing event when the stream closes without a final blank line. */
export function flushChatSseBuffer(buffer: string, onEvent: ChatSseHandler): void {
  const normalized = buffer.replace(/\r\n/g, "\n").trim()
  if (!normalized) return
  for (const block of normalized.split("\n\n")) {
    parseSseBlock(block, onEvent)
  }
  if (!normalized.includes("\n\n")) {
    parseSseBlock(normalized, onEvent)
  }
}
