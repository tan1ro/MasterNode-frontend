"use client"

import { useParams } from "next/navigation"
import { ChatPricingPage } from "@/components/chat/chat-pricing-page"
import { RouteLoading } from "@/components/layout/route-loading"

export default function ChatConversationPricingPage() {
  const params = useParams()
  const chatId = typeof params.chatId === "string" ? params.chatId : ""

  if (!chatId) {
    return <RouteLoading label="Loading pricing" />
  }

  return <ChatPricingPage chatId={chatId} />
}
