import { describe, expect, it, beforeEach, vi } from "vitest"
import {
  markWelcomeBackAfterLoginShown,
  resetChatGreetingSession,
  shouldShowTimeOfDayGreeting,
  shouldShowWelcomeBackAfterLogin,
} from "./chat-first-greeting"

describe("chat-first-greeting", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
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
    resetChatGreetingSession()
  })

  it("shows welcome back first, then time-of-day on later new chats", () => {
    expect(shouldShowWelcomeBackAfterLogin()).toBe(true)
    expect(shouldShowTimeOfDayGreeting()).toBe(false)

    markWelcomeBackAfterLoginShown()

    expect(shouldShowWelcomeBackAfterLogin()).toBe(false)
    expect(shouldShowTimeOfDayGreeting()).toBe(true)
  })

  it("resets welcome on new login session", () => {
    markWelcomeBackAfterLoginShown()
    resetChatGreetingSession()
    expect(shouldShowWelcomeBackAfterLogin()).toBe(true)
    expect(shouldShowTimeOfDayGreeting()).toBe(false)
  })
})
