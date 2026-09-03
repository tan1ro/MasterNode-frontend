import { describe, expect, it } from "vitest"
import { extractDocumentFromTaskResult } from "./document-from-task-result"

describe("document-from-task-result", () => {
  it("extracts markdown prose from pipeline document payload", () => {
    const fields = extractDocumentFromTaskResult({
      output_kind: "document",
      document_title: "UX Case Study Template",
      document_markdown: "# UX Case Study\n\n## Overview\nContent here.",
      final_result: "# UX Case Study\n\n## Overview\nContent here.",
    })
    expect(fields?.title).toBe("UX Case Study Template")
    expect(fields?.markdown).toContain("## Overview")
  })

  it("combines markdown files from a multi-file research deliverable", () => {
    const fields = extractDocumentFromTaskResult({
      output_kind: "document",
      final_result: {
        "references.md": "# References\n\nFamily law sources and citations for India.",
        "marriage-laws.md": "# Marriage Laws\n\nHindu Marriage Act, 1955 governs marriage for Hindus.",
      },
    })
    expect(fields?.markdown).toContain("# References")
    expect(fields?.markdown).toContain("# Marriage Laws")
    expect(fields?.title).toBeTruthy()
  })
})
