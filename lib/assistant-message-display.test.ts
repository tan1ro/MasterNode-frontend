import { describe, expect, it } from "vitest"
import {
  buildUserAssistantIntakeMetadata,
  parseAssistantIntakeDisplay,
  shouldRenderAssistantIntakeBubble,
} from "./assistant-message-display"

describe("assistant-message-display", () => {
  it("builds persisted metadata for assistant intake sends", () => {
    const metadata = buildUserAssistantIntakeMetadata([
      {
        templateId: "sample-academics-placement-coordinator",
        templateName: "Internship & placement coordinator",
        keywords: {
          program: "RV University",
          cohort: "2027",
          season: "Summer",
        },
      },
    ])
    expect(metadata?.assistant_intake_display).toBe(true)
    expect(metadata?.agent_template_name).toBe("Internship & placement coordinator")
    expect(metadata?.assistant_keywords).toEqual({
      program: "RV University",
      cohort: "2027",
      season: "Summer",
    })
  })

  it("parses assistant intake metadata for rendering", () => {
    const parsed = parseAssistantIntakeDisplay({
      assistant_intake_display: true,
      agent_template_id: "sample-academics-placement-coordinator",
      agent_template_name: "Internship & placement coordinator",
      assistant_keywords: {
        program: "RV University",
        cohort: "2027",
        season: "Summer",
      },
    })
    expect(parsed).toHaveLength(1)
    expect(shouldRenderAssistantIntakeBubble({ assistant_intake_display: true })).toBe(
      false
    )
    expect(
      shouldRenderAssistantIntakeBubble({
        assistant_intake_display: true,
        agent_template_id: "x",
        assistant_keywords: { program: "RV University" },
      })
    ).toBe(true)
  })

  it("persists original prompt and clarify trail with intake answers", () => {
    const metadata = buildUserAssistantIntakeMetadata(
      [
        {
          templateId: "competitor-financial-analysis",
          templateName: "Competitor Financial Analysis",
          keywords: {
            competitors: "Technology",
            market: "Global",
            product: "It Suite Analytics",
            goal: "Pricing strategy",
          },
        },
      ],
      {
        userPrompt: "Tell me about it based on the writeup",
        clarifyTrail: [
          {
            prompt: "Which product should we focus on?",
            answer: "It Suite Analytics",
            reason: "Your message said “it” without naming the product.",
          },
        ],
      }
    )
    expect(metadata?.assistant_intake_user_prompt).toBe(
      "Tell me about it based on the writeup"
    )
    expect(metadata?.assistant_intake_clarify_trail).toEqual([
      {
        prompt: "Which product should we focus on?",
        answer: "It Suite Analytics",
        reason: "Your message said “it” without naming the product.",
      },
    ])
  })
})
