import { describe, expect, it } from "vitest"
import {
  formatOffsetVsUserTime,
  getZonedClockParts,
} from "@/lib/live-timezone-clock"

describe("live-timezone-clock", () => {
  it("formats Melbourne clock parts", () => {
    const at = new Date("2026-07-09T12:54:00.000Z")
    const parts = getZonedClockParts("Australia/Melbourne", at)
    expect(parts.time24).toMatch(/^\d{2}:\d{2}$/)
    expect(parts.hour).toBeGreaterThanOrEqual(0)
    expect(parts.second).toBe(0)
  })

  it("formats offset vs user time", () => {
    const text = formatOffsetVsUserTime(
      "Australia/Melbourne",
      "Asia/Kolkata",
      new Date("2026-07-09T12:00:00.000Z")
    )
    expect(text.startsWith("Today,")).toBe(true)
  })
})
