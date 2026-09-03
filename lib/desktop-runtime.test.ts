import { describe, expect, it } from "vitest"
import { DESKTOP_UA_TOKEN, desktopOsFromUserAgent, isMasterNodeDesktop } from "./desktop-runtime"

describe("desktop-runtime", () => {
  it("detects the native shell user agent", () => {
    expect(isMasterNodeDesktop(`Mozilla/5.0 ${DESKTOP_UA_TOKEN}/1.0.0`)).toBe(true)
    expect(isMasterNodeDesktop("Mozilla/5.0 (Macintosh)")).toBe(false)
  })

  it("treats the native preload bridge as desktop even without a user-agent token", () => {
    const previous = window.masternodeDesktop
    window.masternodeDesktop = { isDesktop: true }
    expect(isMasterNodeDesktop(window.navigator.userAgent)).toBe(true)
    window.masternodeDesktop = previous
  })

  it("treats the mn-desktop document class as the native shell", () => {
    const previous = window.masternodeDesktop
    window.masternodeDesktop = undefined
    document.documentElement.classList.add("mn-desktop")
    expect(isMasterNodeDesktop()).toBe(true)
    document.documentElement.classList.remove("mn-desktop")
    expect(isMasterNodeDesktop()).toBe(false)
    window.masternodeDesktop = previous
  })

  it("reads OS from the user agent", () => {
    expect(desktopOsFromUserAgent("Mozilla/5.0 (Windows NT 10.0)")).toBe("windows")
    expect(desktopOsFromUserAgent("Mozilla/5.0 (X11; Linux x86_64)")).toBe("linux")
    expect(desktopOsFromUserAgent("Mozilla/5.0 (Macintosh)")).toBe("mac")
  })
})
