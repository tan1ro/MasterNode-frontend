import { describe, expect, it } from "vitest"
import {
  CHAT_PRICING_PATH,
  chatConversationPricingPath,
  isChatPricingRoute,
  parseChatConversationIdFromPathname,
  plansPricingHref,
} from "@/lib/chat-path"

describe("parseChatConversationIdFromPathname", () => {
  it("returns null for draft chat", () => {
    expect(parseChatConversationIdFromPathname("/chat")).toBeNull()
  })

  it("returns null for draft chat pricing route", () => {
    expect(parseChatConversationIdFromPathname("/chat/pricing")).toBeNull()
  })

  it("parses conversation id from deep link", () => {
    expect(parseChatConversationIdFromPathname("/chat/abc-123")).toBe("abc-123")
  })

  it("parses conversation id from pricing deep link", () => {
    expect(parseChatConversationIdFromPathname("/chat/abc-123/pricing")).toBe("abc-123")
  })

  it("decodes encoded ids", () => {
    expect(parseChatConversationIdFromPathname("/chat/foo%2Fbar")).toBe("foo/bar")
  })

  it("returns null for unrelated paths", () => {
    expect(parseChatConversationIdFromPathname("/tasks/1")).toBeNull()
  })
})

describe("pricing routes", () => {
  it("detects chat pricing paths", () => {
    expect(isChatPricingRoute("/chat/pricing")).toBe(true)
    expect(isChatPricingRoute("/chat/abc/pricing")).toBe(true)
    expect(isChatPricingRoute("/chat")).toBe(false)
  })

  it("builds conversation pricing href", () => {
    expect(chatConversationPricingPath("abc-123")).toBe("/chat/abc-123/pricing")
    expect(plansPricingHref("abc-123")).toBe("/chat/abc-123/pricing")
    expect(plansPricingHref(null)).toBe(CHAT_PRICING_PATH)
  })
})
