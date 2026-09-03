import { describe, expect, it } from "vitest"
import { draftAgentPromptFromDescription, slugifyTemplateId } from "@/lib/agent-prompt-draft"

describe("slugifyTemplateId", () => {
  it("lowercases and hyphenates display names", () => {
    expect(slugifyTemplateId("Legal Planner")).toBe("legal-planner")
    expect(slugifyTemplateId("legal")).toBe("legal")
  })
})

describe("draftAgentPromptFromDescription", () => {
  it("returns empty when description is blank", () => {
    expect(draftAgentPromptFromDescription({ name: "Legal", description: "  " })).toBe("")
  })

  it("drafts a legal-aware prompt with document placeholders", () => {
    const prompt = draftAgentPromptFromDescription({
      name: "Legal",
      description: "Review contracts for commercial and compliance risks.",
    })
    expect(prompt).toContain("You are a Legal assistant.")
    expect(prompt).toContain("not legal advice")
    expect(prompt).toContain("{document}")
    expect(prompt).toContain("{context}")
  })

  it("uses code placeholders for engineering descriptions", () => {
    const prompt = draftAgentPromptFromDescription({
      name: "Code reviewer",
      description: "Review code snippets for bugs and security issues.",
    })
    expect(prompt).toContain("{code}")
    expect(prompt).toContain("{context}")
  })
})
