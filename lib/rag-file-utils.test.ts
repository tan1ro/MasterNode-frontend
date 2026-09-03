import { describe, expect, it } from "vitest"
import { ragFileDisplayExt } from "@/lib/rag-file-utils"

describe("ragFileDisplayExt", () => {
  it("uses filename extension when present", () => {
    expect(ragFileDisplayExt({ filename: "Agent Land vs MasterNode.pdf", file_type: "txt" })).toBe(
      "pdf"
    )
    expect(ragFileDisplayExt({ filename: "FullStackDevelopment.pptx" })).toBe("pptx")
  })

  it("falls back to normalized api file_type", () => {
    expect(ragFileDisplayExt({ filename: "report", file_type: "PDF" })).toBe("pdf")
    expect(
      ragFileDisplayExt({
        filename: "deck",
        file_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      })
    ).toBe("pptx")
  })
})
