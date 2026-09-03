import { describe, expect, it } from "vitest"
import { buildAssistantIntakeFields } from "@/lib/assistant-intake"
import {
  filterSubstantiveIntakeValues,
  isSubstantiveIntakeValue,
  isVagueUserPrompt,
} from "@/lib/assistant-intake-quality"
import type { AgentTemplateApi } from "@/types/api"

const rfpResponse: AgentTemplateApi = {
  template_id: "sample-sales-rfp-response",
  name: "RFP / RFI response",
  prompt_template: "RFP: {rfp}\nSolution: {solution}\nDeadline: {deadline}",
  variables: ["rfp", "solution", "deadline"],
}

describe("isSubstantiveIntakeValue", () => {
  it("rejects vague project intent placeholders", () => {
    expect(isSubstantiveIntakeValue("I want for my project here")).toBe(false)
    expect(isSubstantiveIntakeValue("I want for my project")).toBe(false)
    expect(isSubstantiveIntakeValue("want it rfi")).toBe(false)
    expect(isSubstantiveIntakeValue("N")).toBe(false)
    expect(isSubstantiveIntakeValue("tell me")).toBe(false)
  })

  it("detects vague user prompts that must force intake", () => {
    expect(isVagueUserPrompt("I want it rfi")).toBe(true)
    expect(isVagueUserPrompt("want it rfi")).toBe(true)
    expect(isVagueUserPrompt("rfi please")).toBe(true)
    expect(isVagueUserPrompt("Tell me about it based on writeup")).toBe(true)
    expect(isVagueUserPrompt("tell me about the market")).toBe(true)
    expect(
      isVagueUserPrompt("Cloud migration RFP for state agency with SOC 2 requirements")
    ).toBe(false)
  })

  it("rejects deictic writeup prompts as field values", () => {
    expect(isSubstantiveIntakeValue("Tell me about it based on writeup")).toBe(false)
  })

  it("accepts specific labeled answers", () => {
    expect(
      isSubstantiveIntakeValue(
        "Cloud migration tender for state agency with SOC 2 requirements"
      )
    ).toBe(true)
    expect(isSubstantiveIntakeValue("March 15, 2026")).toBe(true)
  })

  it("filters weak values out of prefilled maps", () => {
    const fields = buildAssistantIntakeFields(rfpResponse)
    const filtered = filterSubstantiveIntakeValues(
      {
        rfp: "I want for my project here",
        solution: "Hybrid Azure landing zone with managed SOC",
        deadline: "N",
      },
      fields
    )
    expect(filtered).toEqual({
      solution: "Hybrid Azure landing zone with managed SOC",
    })
  })
})
