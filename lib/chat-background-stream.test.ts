import { describe, expect, it } from "vitest"
import {
  appendBackgroundStreamToken,
  createBackgroundChatStream,
  hasBackgroundStream,
  isViewingBackgroundStream,
  setBackgroundStream,
} from "./chat-background-stream"

describe("chat-background-stream", () => {
  it("tracks tokens per conversation", () => {
    let stream = createBackgroundChatStream("chat_1", "hello")
    stream = appendBackgroundStreamToken(stream, "Hi ")
    stream = appendBackgroundStreamToken(stream, "there")
    expect(stream.streamingText).toBe("Hi there")
  })

  it("detects when the active view matches the streaming conversation", () => {
    const stream = createBackgroundChatStream("chat_1", "q")
    expect(isViewingBackgroundStream("chat_1", stream)).toBe(true)
    expect(isViewingBackgroundStream("chat_2", stream)).toBe(false)
  })

  it("tracks multiple conversations in the store", () => {
    const store = new Map<string, ReturnType<typeof createBackgroundChatStream>>()
    setBackgroundStream(store, createBackgroundChatStream("chat_1", "a"))
    setBackgroundStream(store, createBackgroundChatStream("chat_2", "b"))
    expect(hasBackgroundStream(store, "chat_1")).toBe(true)
    expect(hasBackgroundStream(store, "chat_2")).toBe(true)
    expect(hasBackgroundStream(store, "chat_3")).toBe(false)
  })
})
