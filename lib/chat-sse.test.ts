import { describe, expect, it, vi } from "vitest"
import { consumeChatSseBuffer } from "./chat-sse"

describe("consumeChatSseBuffer", () => {
  it("parses CRLF-delimited events", () => {
    const events: Array<[string, string]> = []
    consumeChatSseBuffer(
      'event: token\r\ndata: {"delta":"Hi"}\r\n\r\n',
      (e, d) => events.push([e, d])
    )
    expect(events).toEqual([["token", '{"delta":"Hi"}']])
  })

  it("keeps incomplete blocks in the buffer", () => {
    const events: string[] = []
    let rest = consumeChatSseBuffer('event: token\ndata: {"del', (e) => {
      events.push(e)
    })
    expect(events).toHaveLength(0)
    expect(rest).toContain("event: token")
    rest = consumeChatSseBuffer(`${rest}ta":"x"}\n\n`, (e) => events.push(e))
    expect(events).toEqual(["token"])
  })
})
