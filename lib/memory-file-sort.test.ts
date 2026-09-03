import { describe, expect, it } from "vitest"
import { compareMemoryFiles, sortMemoryFiles } from "@/lib/memory-file-sort"
import type { RagFile } from "@/types/api"

const files: RagFile[] = [
  { file_id: "1", filename: "beta.pdf", size_bytes: 200, created_at: "2026-06-01T00:00:00Z" },
  { file_id: "2", filename: "alpha.docx", size_bytes: 100, created_at: "2026-06-08T00:00:00Z" },
]

describe("memory-file-sort", () => {
  it("sorts by name ascending", () => {
    const sorted = sortMemoryFiles(files, "name", "asc", () => false)
    expect(sorted.map((f) => f.filename)).toEqual(["alpha.docx", "beta.pdf"])
  })

  it("sorts by added descending", () => {
    const sorted = sortMemoryFiles(files, "added", "desc", () => false)
    expect(sorted.map((f) => f.filename)).toEqual(["alpha.docx", "beta.pdf"])
  })

  it("sorts enabled files first", () => {
    const isEnabled = (key: string) => key === "beta.pdf"
    expect(compareMemoryFiles(files[1], files[0], "enabled", isEnabled)).toBeLessThan(0)
    const sorted = sortMemoryFiles(files, "enabled", "desc", isEnabled)
    expect(sorted[0]?.filename).toBe("beta.pdf")
  })
})
