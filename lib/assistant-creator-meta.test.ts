import { describe, expect, it } from "vitest"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import { outputFormatLabel } from "@/constants/assistant-output-formats"
import {
  domainFocusForSample,
  domainFocusForTemplate,
  outputFormatsForSample,
  outputFormatsForTemplate,
} from "@/lib/assistant-creator-meta"

describe("assistant-creator-meta", () => {
  it("maps research helper to Research domain", () => {
    const sample = SAMPLE_AGENT_TEMPLATES.find((t) => t.template_id === "sample-custom-research")
    expect(sample).toBeDefined()
    expect(domainFocusForSample(sample!)).toBe("Research")
    expect(outputFormatsForSample(sample!)).toContain("research")
  })

  it("labels output formats", () => {
    expect(outputFormatLabel("pptx")).toBe("PPTX")
    expect(outputFormatLabel("video")).toBe("Video")
  })

  it("uses Marketing / Sales / Presales lanes for revenue assistants", () => {
    expect(domainFocusForTemplate("sample-marketing-ad-copy", { domain_focus: "Digital" })).toBe(
      "Marketing"
    )
    expect(domainFocusForTemplate("sample-sales-lead-qualification-engine", {})).toBe("Sales")
    expect(domainFocusForTemplate("sample-presales-demo-specialist", {})).toBe("Presales")
  })

  it("uses academics lanes for built-in academics assistants", () => {
    expect(domainFocusForTemplate("sample-academics-lesson-planner", { domain_focus: "Content" })).toBe(
      "Teaching"
    )
    expect(domainFocusForTemplate("sample-academics-thesis-planner", {})).toBe("Research")
    expect(domainFocusForTemplate("sample-academics-placement-coordinator", {})).toBe("Student success")
    expect(domainFocusForTemplate("sample-academics-naac-nba-prep", {})).toBe("Accreditation")
    expect(outputFormatsForTemplate("sample-custom-research", {})).toContain("research")
  })
})
