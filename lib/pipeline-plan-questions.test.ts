import { describe, expect, it } from "vitest"
import {
  allPlanQuestionsAnswered,
  buildEncodedPlanAnswers,
  decodePlanAnswer,
  encodePlanAnswer,
  isPlanQuestionAnswered,
  optionsWithOther,
  PLAN_OTHER_OPTION_ID,
  resolvePlanAnswerLabel,
} from "@/lib/pipeline-plan-questions"
import type { PipelinePlanQuestion } from "@/lib/pipeline-plan"

const QUESTIONS: PipelinePlanQuestion[] = [
  {
    id: "audience",
    prompt: "Who is the audience?",
    options: [
      { id: "a", label: "Beginners" },
      { id: "b", label: "Experts" },
    ],
  },
  {
    id: "depth",
    prompt: "How deep?",
    options: [{ id: "a", label: "Overview" }],
  },
]

describe("pipeline-plan-questions", () => {
  it("appends an Other option without duplicates", () => {
    const opts = optionsWithOther([
      { id: "a", label: "Beginners" },
      { id: PLAN_OTHER_OPTION_ID, label: "Other" },
    ])
    expect(opts).toHaveLength(2)
    expect(opts[1]?.id).toBe(PLAN_OTHER_OPTION_ID)
  })

  it("encodes and decodes custom Other answers", () => {
    expect(encodePlanAnswer(PLAN_OTHER_OPTION_ID, "Security teams")).toBe(
      "other:Security teams"
    )
    expect(decodePlanAnswer("other:Security teams")).toEqual({
      optionId: PLAN_OTHER_OPTION_ID,
      customText: "Security teams",
    })
  })

  it("requires custom text when Other is selected", () => {
    const answers = { audience: PLAN_OTHER_OPTION_ID, depth: "a" }
    expect(isPlanQuestionAnswered(QUESTIONS[0], answers, {})).toBe(false)
    expect(
      isPlanQuestionAnswered(QUESTIONS[0], answers, { audience: "Custom group" })
    ).toBe(true)
    expect(allPlanQuestionsAnswered(QUESTIONS, answers, { audience: "Custom group" })).toBe(
      true
    )
  })

  it("builds encoded answers for continue payload", () => {
    const encoded = buildEncodedPlanAnswers(
      QUESTIONS,
      { audience: "b", depth: PLAN_OTHER_OPTION_ID },
      { depth: "Executive summary only" }
    )
    expect(encoded).toEqual({
      audience: "b",
      depth: "other:Executive summary only",
    })
  })

  it("resolves display labels for preset and Other answers", () => {
    expect(resolvePlanAnswerLabel(QUESTIONS[0], "b")).toBe("Experts")
    expect(resolvePlanAnswerLabel(QUESTIONS[0], PLAN_OTHER_OPTION_ID, "Legal teams")).toBe(
      "Legal teams"
    )
  })
})
