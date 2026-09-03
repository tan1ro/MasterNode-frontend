import { describe, expect, it } from "vitest"
import {
  assistantThemeForTemplateId,
  categoryForTemplateId,
} from "@/lib/assistant-template-theme"
import { GraduationCap, Megaphone, Sparkles } from "lucide-react"

describe("assistant-template-theme", () => {
  it("resolves academics category from sample template id", () => {
    expect(categoryForTemplateId("sample-academics-exam-blueprint")).toBe("academics")
    expect(assistantThemeForTemplateId("sample-academics-exam-blueprint").icon).toBe(GraduationCap)
  })

  it("resolves sales_marketing from marketing prefix", () => {
    expect(categoryForTemplateId("sample-marketing-campaign-planner")).toBe("sales_marketing")
    expect(assistantThemeForTemplateId("sample-marketing-campaign-planner").icon).toBe(Megaphone)
  })

  it("resolves general gallery theme for Data extractor sample", () => {
    expect(categoryForTemplateId("sample-custom-data-extractor")).toBe("general")
    const theme = assistantThemeForTemplateId("sample-custom-data-extractor")
    expect(theme.icon).toBe(Sparkles)
    expect(theme.token).toBe("amber")
  })

  it("resolves codebase category for code review sample", () => {
    expect(categoryForTemplateId("sample-custom-code-review")).toBe("codebase")
    expect(categoryForTemplateId("sample-codebase-security-reviewer")).toBe("codebase")
    expect(categoryForTemplateId("sample-sdlc-tech-spec-writer")).toBe("sdlc")
  })

  it("falls back to general for unknown custom templates", () => {
    expect(categoryForTemplateId("my-custom-assistant")).toBe("general")
    expect(assistantThemeForTemplateId("my-custom-assistant").icon).toBe(Sparkles)
  })
})
