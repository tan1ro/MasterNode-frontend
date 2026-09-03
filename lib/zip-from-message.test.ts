import { describe, expect, it } from "vitest"
import { resolveZipForMessage } from "@/lib/zip-from-message"

describe("resolveZipForMessage", () => {
  it("returns artifacts from zip metadata", () => {
    const result = resolveZipForMessage({
      zip_title: "Pokemon Explorer",
      zip_filename: "pokemon-explorer.zip",
      zip_artifacts: [
        {
          filename: "pokemon-explorer.zip",
          mime_type: "application/zip",
          base64: "UEsFBg==",
          size_bytes: 4,
        },
      ],
    })
    expect(result?.title).toBe("Pokemon Explorer")
    expect(result?.filename).toBe("pokemon-explorer.zip")
    expect(result?.artifacts).toHaveLength(1)
    expect(result?.artifacts[0]?.mime_type).toBe("application/zip")
  })

  it("returns null when zip artifacts are missing", () => {
    expect(resolveZipForMessage({})).toBeNull()
  })
})
