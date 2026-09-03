import { describe, expect, it } from "vitest"
import JSZip from "jszip"
import {
  buildDocumentFilePreview,
  extractOoxmlTextNodes,
} from "./document-file-preview"
import { attachmentKindFromFile } from "./chat-composer-attachments"

describe("document-file-preview", () => {
  it("classifies docx and pptx files", () => {
    expect(
      attachmentKindFromFile(
        new File(["x"], "JD.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      )
    ).toBe("document")
    expect(
      attachmentKindFromFile(
        new File(["x"], "deck.pptx", {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        })
      )
    ).toBe("presentation")
  })

  it("extracts OOXML text nodes", () => {
    const xml = `<p:sld xmlns:a="${"http://schemas.openxmlformats.org/drawingml/2006/main"}">
      <a:t>Engineering Graduate</a:t>
    </p:sld>`
    expect(extractOoxmlTextNodes(xml)).toContain("Engineering Graduate")
  })

  it("previews plain text files", async () => {
    const file = new File(["hello notes"], "notes.txt", { type: "text/plain" })
    expect(attachmentKindFromFile(file)).toBe("document")
    const preview = await buildDocumentFilePreview(file)
    expect(preview.type).toBe("text")
    if (preview.type === "text") {
      expect(preview.text).toBe("hello notes")
    }
  })

  it("extracts pptx slide text from a zip package", async () => {
    const zip = new JSZip()
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Quarterly roadmap</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>`
    zip.file("ppt/slides/slide1.xml", slideXml)
    const bytes = await zip.generateAsync({ type: "uint8array" })
    const file = new File([bytes], "deck.pptx", {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    })
    expect(attachmentKindFromFile(file)).toBe("presentation")
    const preview = await buildDocumentFilePreview(file)
    expect(preview.type).toBe("slides")
    if (preview.type === "slides") {
      expect(preview.slides[0]?.lines).toContain("Quarterly roadmap")
    }
  })
})
