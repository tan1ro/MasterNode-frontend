import { describe, expect, it } from "vitest"
import {
  formatMessageActionTooltipTime,
  formatMessageDayTime,
  formatMessageThreadDivider,
  formatUserDateTime,
  messageDayKey,
  normalizeUtcIso,
  parseApiTimestamp,
} from "./datetime-local"

describe("normalizeUtcIso", () => {
  it("appends Z to naive API datetimes", () => {
    expect(normalizeUtcIso("2026-06-04T10:14:01")).toBe("2026-06-04T10:14:01Z")
  })

  it("leaves Z and offset forms unchanged", () => {
    expect(normalizeUtcIso("2026-06-04T10:14:01Z")).toBe("2026-06-04T10:14:01Z")
    expect(normalizeUtcIso("2026-06-04T10:14:01+00:00")).toBe("2026-06-04T10:14:01+00:00")
  })
})

describe("parseApiTimestamp", () => {
  it("parses naive UTC as UTC instant (not local wall time)", () => {
    const d = parseApiTimestamp("2026-06-04T10:14:01")
    expect(d?.toISOString()).toBe("2026-06-04T10:14:01.000Z")
  })
})

describe("formatMessageDayTime", () => {
  it("returns empty for invalid iso", () => {
    expect(formatMessageDayTime("")).toBe("")
  })

  it("labels the current instant as Today", () => {
    expect(formatMessageDayTime(new Date().toISOString())).toMatch(/^Today · /)
  })

  it("uses a weekday for older messages", () => {
    const label = formatMessageDayTime("2020-01-15T12:00:00Z")
    expect(label).toContain("·")
    expect(label).not.toMatch(/^Today · /)
  })
})

describe("formatMessageThreadDivider", () => {
  it("returns empty for invalid iso", () => {
    expect(formatMessageThreadDivider("")).toBe("")
  })

  it("labels the current instant as Today at …", () => {
    expect(formatMessageThreadDivider(new Date().toISOString())).toMatch(/^Today at /)
  })

  it("uses weekday + at for older messages", () => {
    const label = formatMessageThreadDivider("2020-01-15T12:00:00Z")
    expect(label).toContain(" at ")
    expect(label).not.toMatch(/^Today at /)
  })
})

describe("messageDayKey", () => {
  it("returns YYYY-MM-DD for a valid timestamp", () => {
    expect(messageDayKey("2020-01-15T12:00:00Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("returns empty for invalid iso", () => {
    expect(messageDayKey("")).toBe("")
  })
})

describe("formatMessageActionTooltipTime", () => {
  it("returns a full timestamp string", () => {
    const label = formatMessageActionTooltipTime("2020-01-15T12:00:00Z")
    expect(label.length).toBeGreaterThan(8)
    expect(label).toMatch(/2020/)
  })
})

describe("formatUserDateTime", () => {
  it("formats UTC API time in the user's timezone (Asia/Kolkata)", () => {
    const label = formatUserDateTime("2026-06-04T10:14:01", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    expect(label).toContain("Jun")
    expect(label).toContain("15:44")
  })
})
