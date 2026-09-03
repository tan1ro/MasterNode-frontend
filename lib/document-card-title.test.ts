import { describe, expect, it } from "vitest"
import { extractDocumentCardTitle } from "@/lib/document-card-title"

describe("extractDocumentCardTitle", () => {
  it("uses first markdown heading", () => {
    const title = extractDocumentCardTitle("# Executive Summary\n\nBody text")
    expect(title).toBe("Executive Summary")
  })
})
