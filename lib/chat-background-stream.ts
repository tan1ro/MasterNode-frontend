import type { ChatToolEvent } from "@/types/api"

export type BackgroundChatStream = {
  conversationId: string
  streamingText: string
  toolEvents: ChatToolEvent[]
  userQuery: string
  streamStartedAt: number | null
}

export type BackgroundChatStreamStore = Map<string, BackgroundChatStream>

export function createBackgroundChatStream(
  conversationId: string,
  userQuery: string
): BackgroundChatStream {
  return {
    conversationId,
    streamingText: "",
    toolEvents: [],
    userQuery,
    streamStartedAt: Date.now(),
  }
}

export function appendBackgroundStreamToken(
  stream: BackgroundChatStream,
  delta: string
): BackgroundChatStream {
  return {
    ...stream,
    streamingText: stream.streamingText + delta,
  }
}

export function appendBackgroundStreamToolEvent(
  stream: BackgroundChatStream,
  event: ChatToolEvent
): BackgroundChatStream {
  return {
    ...stream,
    toolEvents: [...stream.toolEvents, event],
  }
}

export function isViewingBackgroundStream(
  activeConversationId: string | null | undefined,
  stream: BackgroundChatStream | null | undefined
): boolean {
  if (!activeConversationId || !stream) return false
  return stream.conversationId === activeConversationId
}

export function getBackgroundStream(
  store: BackgroundChatStreamStore,
  conversationId: string
): BackgroundChatStream | undefined {
  return store.get(conversationId)
}

export function hasBackgroundStream(
  store: BackgroundChatStreamStore,
  conversationId: string | null | undefined
): boolean {
  if (!conversationId) return false
  return store.has(conversationId)
}

export function setBackgroundStream(
  store: BackgroundChatStreamStore,
  stream: BackgroundChatStream
): void {
  store.set(stream.conversationId, stream)
}

export function removeBackgroundStream(
  store: BackgroundChatStreamStore,
  conversationId: string
): void {
  store.delete(conversationId)
}
