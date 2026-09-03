import { describe, expect, it } from "vitest"
import { RAG_MAX_UPLOAD_BYTES } from "@/constants/rag"
import { validateOnboardingKnowledgeFile } from "@/lib/onboarding-knowledge"

describe("onboarding knowledge helpers", () => {
  it("rejects unsupported upload types", () => {
    const bad = new File(["x"], "notes.exe", { type: "application/octet-stream" })
    expect(validateOnboardingKnowledgeFile(bad)).toBeTruthy()
  })

  it("accepts supported upload types", () => {
    const good = new File(["hello"], "notes.pdf", { type: "application/pdf" })
    expect(validateOnboardingKnowledgeFile(good)).toBeUndefined()
  })

  it("rejects oversized files", () => {
    const huge = new File([new Uint8Array(RAG_MAX_UPLOAD_BYTES + 1)], "big.pdf")
    expect(validateOnboardingKnowledgeFile(huge)).toBeTruthy()
  })
})
