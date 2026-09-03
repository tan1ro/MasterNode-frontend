import { describe, expect, it } from "vitest"
import { INTEGRATION_LOGOS } from "@/constants/integration-logos"

describe("integration logos", () => {
  it("maps all catalog providers to bundled SVG logos", () => {
    const ids = Object.keys(INTEGRATION_LOGOS).sort()
    expect(ids).toEqual(
      [
        "airtable",
        "canva",
        "discord",
        "dropbox",
        "github",
        "google_docs",
        "google_drive",
        "jira",
        "linear",
        "n8n",
        "notion",
        "slack",
        "zapier",
      ].sort()
    )
  })

  it("uses local SVG paths under /integrations/logos/", () => {
    for (const config of Object.values(INTEGRATION_LOGOS)) {
      expect(config.src).toMatch(/^\/integrations\/logos\/.+\.svg$/)
      expect(config.alt.length).toBeGreaterThan(0)
    }
  })
})
