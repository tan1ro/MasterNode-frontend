import { describe, expect, it } from "vitest"
import { resolveWorkspaceDisplayName } from "./workspace-display-name"

describe("workspace-display-name", () => {
  it("prefers saved display name over auth username", () => {
    expect(
      resolveWorkspaceDisplayName({
        prefsDisplayName: "Ada Lovelace",
        username: "ada",
        email: "ada@example.com",
      })
    ).toBe("Ada Lovelace")
  })

  it("falls back to username then email local part", () => {
    expect(resolveWorkspaceDisplayName({ username: "creator" })).toBe("creator")
    expect(resolveWorkspaceDisplayName({ email: "samplecreator@masternode.ai" })).toBe(
      "samplecreator"
    )
  })
})
