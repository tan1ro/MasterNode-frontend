import { describe, expect, it } from "vitest"
import {
  hydrateChatIntroFromProfile,
  isChatIntroCompleted,
  isChatIntroPending,
  markPendingChatIntro,
} from "@/lib/chat-intro-tour"

describe("chat intro tour helpers", () => {
  const tenant = "usr_tour_test"

  it("hydrates completion from server profile", () => {
    hydrateChatIntroFromProfile(tenant, true)
    expect(isChatIntroCompleted(tenant)).toBe(true)
    expect(isChatIntroPending(tenant)).toBe(false)
  })

  it("does not re-queue pending when already completed", () => {
    markPendingChatIntro(tenant)
    expect(isChatIntroPending(tenant)).toBe(false)
  })
})
