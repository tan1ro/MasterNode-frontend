import { describe, expect, it } from "vitest"
import {
  deliverableDocumentsFromFiles,
  deliverableRelativePath,
  humanizeDocumentTitle,
  resolvePipelineViewerMode,
} from "./pipeline-deliverables"
import type { CodeFile } from "./task-result-parser"

describe("pipeline-deliverables", () => {
  it("humanizes markdown filenames into readable titles", () => {
    expect(humanizeDocumentTitle("BEST_PRACTICES_FOUNDER.md")).toBe("Best Practices Founder")
  })

  it("drops bogus src/ prefix for markdown files", () => {
    const path = deliverableRelativePath({
      name: "guide.md",
      content: "# Hi",
      language: "markdown",
      path: "src",
    })
    expect(path).toBe("guide.md")
  })

  it("keeps real folders for markdown nested paths", () => {
    const path = deliverableRelativePath({
      name: "readme.md",
      content: "# Hi",
      language: "markdown",
      path: "docs",
    })
    expect(path).toBe("docs/readme.md")
  })

  it("routes document outputs to the document reader", () => {
    const files: CodeFile[] = [
      { name: "report.md", content: "# Report", language: "markdown" },
    ]
    expect(resolvePipelineViewerMode("document", files)).toBe("document")
    expect(resolvePipelineViewerMode("code", files)).toBe("code")
  })

  it("extracts deliverable documents from file list", () => {
    const docs = deliverableDocumentsFromFiles([
      { name: "A.md", content: "# A", language: "markdown", path: "src" },
      { name: "main.py", content: "print(1)", language: "python", path: "src" },
    ])
    expect(docs).toHaveLength(1)
    expect(docs[0]?.relativePath).toBe("A.md")
  })
})
