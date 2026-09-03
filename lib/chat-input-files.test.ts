import { describe, expect, it } from "vitest"
import { extractFilesFromDataTransfer, hasFilesInDataTransfer } from "./chat-input-files"

function mockDataTransfer(files: File[]) {
  return {
    files,
    items: files.map((file) => ({
      kind: "file" as const,
      getAsFile: () => file,
    })),
  }
}

describe("chat-input-files", () => {
  it("extracts files from a drag or paste payload", () => {
    const screenshot = new File(["img"], "screenshot.png", { type: "image/png" })
    const pdf = new File(["pdf"], "spec.pdf", { type: "application/pdf" })

    expect(extractFilesFromDataTransfer(mockDataTransfer([screenshot, pdf]))).toEqual([
      screenshot,
      pdf,
    ])
  })

  it("returns false when the payload has no files", () => {
    expect(hasFilesInDataTransfer({ files: [], items: [] })).toBe(false)
    expect(extractFilesFromDataTransfer(null)).toEqual([])
  })
})
