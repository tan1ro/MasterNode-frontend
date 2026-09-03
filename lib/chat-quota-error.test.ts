import { describe, expect, it } from "vitest"
import {
  formatQuotaResetClock,
  parseCreditQuotaDetail,
  quotaExceededBodyText,
  quotaExceededComposerLine,
} from "@/lib/chat-quota-error"

describe("chat-quota-error", () => {
  it("parses credit_quota_exceeded detail", () => {
    const parsed = parseCreditQuotaDetail({
      code: "credit_quota_exceeded",
      message: "Limit reached",
      resets_at: "2026-07-05T16:00:00.000Z",
      percent: 100,
    })
    expect(parsed?.resetsAt).toBe("2026-07-05T16:00:00.000Z")
    expect(parsed?.percent).toBe(100)
  })

  it("builds reset copy with clock time", () => {
    const reset = new Date()
    reset.setHours(21, 30, 0, 0)
    const text = quotaExceededBodyText({ resetsAt: reset.toISOString() }, 5)
    expect(text).toContain("5-hour credit limit")
    expect(text).toContain(formatQuotaResetClock(reset.toISOString()) ?? "")
  })

  it("builds composer lock line with reset clock", () => {
    const reset = new Date()
    reset.setHours(18, 40, 0, 0)
    const clock = formatQuotaResetClock(reset.toISOString())
    const line = quotaExceededComposerLine({ resetsAt: reset.toISOString() }, 5)
    expect(line).toBe(`You are out of free credits until ${clock}`)
  })
})
