import { describe, expect, it } from "vitest"
import {
  attachmentBadgeLabel,
  attachmentExtFromFile,
  attachmentKindFromFile,
  attachmentTypeLabel,
  attachmentWarningMessage,
  canPreviewComposerAttachment,
} from "./chat-composer-attachments"

describe("chat-composer-attachments", () => {
  it("detects pdf and presentation kinds", () => {
    expect(
      attachmentKindFromFile(new File(["x"], "resume.pdf", { type: "application/pdf" }))
    ).toBe("pdf")
    expect(
      attachmentKindFromFile(
        new File(["x"], "deck.pptx", {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        })
      )
    ).toBe("presentation")
  })

  it("maps extension to matching type labels", () => {
    const pdf = new File(["x"], "resume.pdf", { type: "application/pdf" })
    const docx = new File(["x"], "JD.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    const pptx = new File(["x"], "deck.pptx", {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    })
    expect(attachmentTypeLabel(pdf)).toBe("PDF")
    expect(attachmentTypeLabel(docx)).toBe("DOCX")
    expect(attachmentTypeLabel(pptx)).toBe("PPTX")
  })

  it("exposes extension-accurate badge labels", () => {
    const docx = new File(["x"], "JD.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    expect(attachmentBadgeLabel(new File(["x"], "resume.pdf", { type: "application/pdf" }))).toBe(
      "PDF"
    )
    expect(attachmentBadgeLabel(docx)).toBe("DOCX")
    expect(attachmentExtFromFile(docx)).toBe("docx")
  })

  it("allows preview for office documents", () => {
    expect(
      canPreviewComposerAttachment(
        new File(["x"], "JD.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      )
    ).toBe(true)
  })

  it("surfaces attachment warnings from API metadata", () => {
    expect(
      attachmentWarningMessage({
        attachment_id: "att_1",
        conversation_id: "c1",
        filename: "scan.pdf",
        preview_available: true,
        text_available: false,
        warning: "No readable text found in this PDF.",
      })
    ).toBe("No readable text found in this PDF.")
    expect(
      attachmentWarningMessage({
        attachment_id: "att_2",
        conversation_id: "c1",
        filename: "big.pdf",
        preview_available: false,
        text_available: true,
      })
    ).toBe("Preview unavailable — text was still used in chat.")
  })
})
