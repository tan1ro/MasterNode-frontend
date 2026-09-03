import { describe, expect, it } from "vitest"
import { CHANGELOG_META, CHANGELOG_VERSIONS } from "@/content/help/changelog"

describe("CHANGELOG_VERSIONS", () => {
  it("has semver-grouped entries newest first", () => {
    expect(CHANGELOG_META.title).toBe("Changelog")
    expect(CHANGELOG_VERSIONS.length).toBeGreaterThanOrEqual(5)

    const dates = CHANGELOG_VERSIONS.map((v) => v.date)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)

    for (const entry of CHANGELOG_VERSIONS) {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(entry.sections.length).toBeGreaterThan(0)
      expect(entry.sections.some((s) => s.items.length > 0)).toBe(true)
    }
  })
})
