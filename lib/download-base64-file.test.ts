import { describe, expect, it } from "vitest"
import { normalizeBase64Payload } from "@/lib/download-base64-file"

describe("normalizeBase64Payload", () => {
  it("strips data-uri prefix and whitespace", () => {
    const raw = btoa("hello")
    expect(normalizeBase64Payload(`data:application/pdf;base64, ${raw}`)).toBe(raw)
  })
})
