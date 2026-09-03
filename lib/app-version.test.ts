import { describe, expect, it } from "vitest"
import { CHANGELOG_VERSIONS } from "@/content/help/changelog"
import { APP_VERSION, APP_VERSION_LABEL, formatAppVersion } from "@/lib/app-version"

describe("app-version", () => {
  it("tracks the newest changelog semver", () => {
    expect(APP_VERSION).toBe(CHANGELOG_VERSIONS[0].version)
    expect(APP_VERSION_LABEL).toBe(`v${CHANGELOG_VERSIONS[0].version}`)
    expect(formatAppVersion()).toBe(`Version ${CHANGELOG_VERSIONS[0].version}`)
  })
})
