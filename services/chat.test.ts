import { describe, expect, it, vi } from "vitest"
import { chatService } from "./chat"

function streamFromText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
}

describe("chatService.streamReply", () => {
  it("parses token/tool/done stream events", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamFromText(
        [
          'event: token\ndata: {"delta":"Hel"}\n\n',
          'event: token\ndata: {"delta":"lo"}\n\n',
          'event: tool_call_started\ndata: {"type":"tool_call_started","name":"chat_completion"}\n\n',
          'event: done\ndata: {"message":{"message_id":"m1","conversation_id":"c1","role":"assistant","content":"Hello","created_at":"2026-01-01T00:00:00Z"}}\n\n',
        ].join("")
      ),
    })
    vi.stubGlobal("fetch", mockFetch)
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })

    let tokenText = ""
    let doneMessageId = ""
    let toolType = ""
    await chatService.streamReply(
      "c1",
      { message: "hi" },
      {
        onToken: (delta) => {
          tokenText += delta
        },
        onDone: (payload) => {
          doneMessageId = payload.message.message_id
        },
        onError: () => {},
        onToolEvent: (event) => {
          toolType = event.type
        },
      }
    )
    expect(tokenText).toBe("Hello")
    expect(doneMessageId).toBe("m1")
    expect(toolType).toBe("tool_call_started")
  })

  it("parses final done event when stream ends without trailing blank line", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamFromText(
        'event: token\ndata: {"delta":"Hi"}\n\nevent: done\ndata: {"message":{"message_id":"m2","conversation_id":"c1","role":"assistant","content":"Hi","created_at":"2026-01-01T00:00:00Z"}}'
      ),
    })
    vi.stubGlobal("fetch", mockFetch)
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })

    let doneMessageId = ""
    await chatService.streamReply(
      "c1",
      { message: "hi" },
      {
        onToken: () => {},
        onDone: (payload) => {
          doneMessageId = payload.message.message_id
        },
        onError: () => {},
      }
    )
    expect(doneMessageId).toBe("m2")
  })

  it("routes stream error events to handler", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamFromText('event: error\ndata: {"message":"boom"}\n\n'),
    })
    vi.stubGlobal("fetch", mockFetch)
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
    let err = ""
    await chatService.streamReply(
      "c1",
      { message: "hi" },
      {
        onToken: () => {},
        onDone: () => {},
        onError: (m) => {
          err = m
        },
      }
    )
    expect(err).toBe("boom")
  })

  it("emits transport error when streaming endpoint is not ok", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      body: null,
    })
    vi.stubGlobal("fetch", mockFetch)
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })

    let err = ""
    await chatService.streamReply("c1", { message: "hi" }, {
      onToken: () => {},
      onDone: () => {},
      onError: (message) => {
        err = message
      },
    })
    expect(err).toBe("Streaming failed (503)")
  })
})
