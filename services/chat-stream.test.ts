import { describe, expect, it, vi } from "vitest"
import { chatService } from "./chat"

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let i = 0
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(chunks[i++]))
    },
  })
}

describe("chatService.streamReply incremental", () => {
  it("parses tokens split across multiple reads", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamFromChunks([
        'event: token\ndata: {"delta":"Hel"',
        '}\n\n',
        'event: token\ndata: {"delta":"lo"}\n\n',
      ]),
    })
    vi.stubGlobal("fetch", mockFetch)
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })

    let tokenText = ""
    await chatService.streamReply(
      "c1",
      { message: "hi" },
      {
        onToken: (delta) => {
          tokenText += delta
        },
        onDone: () => {},
        onError: () => {},
      }
    )
    expect(tokenText).toBe("Hello")
  })
})

describe("chatService.streamReply abort", () => {
  it("invokes onAborted when the request is cancelled", async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")))
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })

    let aborted = false
    await chatService.streamReply(
      "c1",
      { message: "hi" },
      {
        onToken: () => {},
        onDone: () => {},
        onError: () => {},
        onAborted: () => {
          aborted = true
        },
      },
      { signal: controller.signal }
    )
    expect(aborted).toBe(true)
  })
})
