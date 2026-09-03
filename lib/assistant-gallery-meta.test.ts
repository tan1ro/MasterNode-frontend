import { describe, expect, it } from "vitest"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import { getAssistantGalleryMeta } from "@/lib/assistant-gallery-meta"

describe("assistant-gallery-meta", () => {
  it("enriches Research helper with detail and variables", () => {
    const sample = SAMPLE_AGENT_TEMPLATES.find((t) => t.template_id === "sample-custom-research")
    expect(sample).toBeDefined()
    const meta = getAssistantGalleryMeta(sample!)
    expect(meta.title).toBe("Research Helper")
    expect(meta.domainFocus).toBe("Research")
    expect(meta.outputFormats.length).toBeGreaterThan(0)
    expect(meta.summary).toContain("research")
    expect(meta.detail.length).toBeGreaterThan(40)
    expect(meta.variables).toEqual(["topic"])
    expect(meta.promptPreview).toContain("research assistant")
  })

  it("falls back for templates without explicit gallery copy", () => {
    const sample = SAMPLE_AGENT_TEMPLATES.find((t) => t.template_id === "sample-codebase-copilot")
    expect(sample).toBeDefined()
    const meta = getAssistantGalleryMeta(sample!)
    expect(meta.summary.length).toBeGreaterThan(10)
    expect(meta.pipelineUsage).toContain("pipeline")
  })

  it("includes template id for icon resolution", () => {
    const sample = SAMPLE_AGENT_TEMPLATES.find(
      (t) => t.template_id === "sample-sales-discovery-facilitator"
    )
    expect(sample).toBeDefined()
    const meta = getAssistantGalleryMeta(sample!)
    expect(meta.templateId).toBe("sample-sales-discovery-facilitator")
    expect(meta.domainFocus).toBe("Sales")
  })
})
