import { describe, expect, it, vi, beforeEach } from "vitest"

describe("guest-chat-session", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null
      },
      setItem(key: string, value: string) {
        this.store[key] = value
      },
      removeItem(key: string) {
        delete this.store[key]
      },
    })
  })

  it("tracks guest conversations only for the current tab session", async () => {
    const {
      registerGuestConversationId,
      isGuestConversationInSession,
      clearGuestChatSession,
    } = await import("@/lib/guest-chat-session")

    registerGuestConversationId("conv_1")
    expect(isGuestConversationInSession("conv_1")).toBe(true)
    expect(isGuestConversationInSession("conv_2")).toBe(false)

    clearGuestChatSession()
    expect(isGuestConversationInSession("conv_1")).toBe(false)
  })
})
