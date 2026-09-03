import { afterEach, describe, expect, it } from "vitest"
import { isAppleDevice } from "./apple-device"

describe("isAppleDevice", () => {
  it("returns false when navigator is unavailable", () => {
    expect(isAppleDevice()).toBe(false)
  })
})

// Browser-only behavior is validated via userAgent/platform mocks when jsdom is available.
if (typeof navigator !== "undefined") {
  describe("isAppleDevice (jsdom)", () => {
    const original = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    }

    afterEach(() => {
      Object.defineProperty(navigator, "userAgent", { value: original.userAgent, configurable: true })
      Object.defineProperty(navigator, "platform", { value: original.platform, configurable: true })
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: original.maxTouchPoints,
        configurable: true,
      })
    })

    it("detects iPhone", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        configurable: true,
      })
      Object.defineProperty(navigator, "platform", { value: "iPhone", configurable: true })
      expect(isAppleDevice()).toBe(true)
    })

    it("detects Mac", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        configurable: true,
      })
      Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true })
      Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true })
      expect(isAppleDevice()).toBe(true)
    })

    it("detects iPad masquerading as MacIntel", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        configurable: true,
      })
      Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true })
      Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true })
      expect(isAppleDevice()).toBe(true)
    })

    it("returns false for Windows", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        configurable: true,
      })
      Object.defineProperty(navigator, "platform", { value: "Win32", configurable: true })
      Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true })
      expect(isAppleDevice()).toBe(false)
    })
  })
}
