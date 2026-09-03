"use client"

import React from "react"
import { ChatStreamingStatus } from "@/components/chat/chat-streaming-status"
import { formatWebSearchStatusLine } from "@/lib/chat-web-search-status"

export function ChatWebSearchStatus({
  queries,
  className,
}: {
  queries: string[]
  className?: string
}) {
  const line = formatWebSearchStatusLine(queries)

  return <ChatStreamingStatus label={line} className={className} />
}
