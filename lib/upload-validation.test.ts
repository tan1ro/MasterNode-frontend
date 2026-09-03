import { describe, expect, it } from "vitest"
import { resolveUploadLimits } from "@/constants/upload-limits"
import { validateChatFileUpload, validateProjectFileUpload } from "@/lib/upload-validation"

describe("upload-validation", () => {
  it("allows enterprise-sized chat documents", () => {
    const limits = resolveUploadLimits("enterprise", "creator")
    const file = new File([new Uint8Array(500 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    })
    Object.defineProperty(file, "size", { value: 500 * 1024 * 1024 })
    const result = validateChatFileUpload(file, limits, 0)
    expect(result.ok).toBe(true)
  })

  it("rejects files beyond per-chat count", () => {
    const limits = resolveUploadLimits("free", "creator")
    const file = new File(["hello"], "a.txt", { type: "text/plain" })
    const result = validateChatFileUpload(file, limits, 5)
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/5/)
  })

  it("enforces project knowledge cap", () => {
    const limits = resolveUploadLimits("pro", "creator")
    const file = new File([new Uint8Array(31 * 1024 * 1024)], "doc.pdf", {
      type: "application/pdf",
    })
    Object.defineProperty(file, "size", { value: 31 * 1024 * 1024 })
    const result = validateProjectFileUpload(file, limits)
    expect(result.ok).toBe(false)
  })
})
