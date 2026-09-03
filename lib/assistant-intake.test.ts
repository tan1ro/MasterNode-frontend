import { describe, expect, it } from "vitest"
import {
  buildAssistantIntakeFields,
  fillAssistantPromptTemplate,
  hasAnyIntakeValue,
  hasFileField,
  intakeFieldQuestion,
  intakeSubmitLabel,
  isIntakeFieldAnswered,
  templateHasIntake,
} from "./assistant-intake"
import type { AgentTemplateApi } from "@/types/api"

const courseBuilder: AgentTemplateApi = {
  template_id: "sample-academics-course-outline",
  name: "Course outline & credit planner",
  description: "Syllabus-level outline with topics, credits, workload, and references.",
  prompt_template:
    "Draft course outline.\nCourse: {course}\nCredits: {credits}\nAudience: {audience}\nReturn weekly topics, readings, workload estimate, and policies stub.",
  variables: ["course", "credits", "audience"],
}

const syllabusAuditor: AgentTemplateApi = {
  template_id: "sample-academics-syllabus-auditor",
  name: "Syllabus coverage auditor",
  description: "Audits syllabus coverage against outcomes.",
  prompt_template:
    "Audit syllabus coverage.\nSyllabus: {syllabus}\nCO/PO mapping: {mapping}\nReturn coverage gaps.",
  variables: ["syllabus", "mapping"],
}

describe("buildAssistantIntakeFields", () => {
  it("maps known variables to friendly labels and examples", () => {
    const fields = buildAssistantIntakeFields(courseBuilder)
    expect(fields.map((f) => f.label)).toEqual([
      "Course Title",
      "Course Outcomes",
      "Target Audience",
      "Credits",
      "L:T:P Ratio",
    ])
    expect(fields[0].placeholder).toContain("Machine Learning")
    expect(fields.filter((f) => f.kind === "short").length).toBeGreaterThan(0)
  })

  it("renders a file dropzone for upload-style variables and long inputs for mappings", () => {
    const fields = buildAssistantIntakeFields(syllabusAuditor)
    expect(fields.find((f) => f.name === "syllabus")?.kind).toBe("file")
    expect(fields.find((f) => f.name === "mapping")?.kind).toBe("long")
  })

  it("humanizes unknown variables", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "x",
      name: "X",
      prompt_template: "Do {launch_date}",
      variables: ["launch_date"],
    })
    expect(fields[0].label).toBe("Launch Date")
  })

  it("returns no fields when there are no variables", () => {
    expect(
      buildAssistantIntakeFields({ template_id: "x", name: "X", prompt_template: "hi" })
    ).toEqual([])
    expect(templateHasIntake({ template_id: "x", name: "X" })).toBe(false)
  })
})

describe("templateHasIntake selectivity", () => {
  const single = (variable: string, prompt = `Do {${variable}}`): AgentTemplateApi => ({
    template_id: `single-${variable}`,
    name: "Single",
    prompt_template: prompt,
    variables: [variable],
  })

  it("skips a single short field (just type it in chat)", () => {
    expect(templateHasIntake(single("topic"))).toBe(false)
  })

  it("shows a single long paste field", () => {
    expect(templateHasIntake(single("outcome"))).toBe(true)
  })

  it("shows a single file field", () => {
    expect(templateHasIntake(single("syllabus"))).toBe(true)
  })

  it("shows when there are two or more fields", () => {
    expect(templateHasIntake(courseBuilder)).toBe(true)
    expect(templateHasIntake(syllabusAuditor)).toBe(true)
  })
})

describe("fillAssistantPromptTemplate", () => {
  it("substitutes provided values into the prompt template", () => {
    const out = fillAssistantPromptTemplate(courseBuilder, {
      course: "Introduction to ML",
      credits: "3",
      audience: "B.Tech CSE",
    })
    expect(out).toContain("Course: Introduction to ML")
    expect(out).toContain("Credits: 3")
    expect(out).toContain("Audience: B.Tech CSE")
    expect(out).not.toContain("{")
  })

  it("drops label lines whose value is empty", () => {
    const out = fillAssistantPromptTemplate(courseBuilder, {
      course: "Introduction to ML",
    })
    expect(out).toContain("Course: Introduction to ML")
    expect(out).not.toContain("Credits:")
    expect(out).not.toContain("Audience:")
  })

  it("falls back to a labeled list when there is no prompt body", () => {
    const out = fillAssistantPromptTemplate(
      {
        template_id: "x",
        name: "Custom Helper",
        prompt_template: "",
        variables: ["topic"],
      },
      { topic: "Quantum" }
    )
    expect(out).toContain("Custom Helper request:")
    expect(out).toContain("- Topic: Quantum")
  })
})

describe("hasAnyIntakeValue", () => {
  it("detects at least one non-empty value", () => {
    expect(hasAnyIntakeValue({ a: "", b: "  " })).toBe(false)
    expect(hasAnyIntakeValue({ a: "", b: "x" })).toBe(true)
  })
})

describe("intakeFieldQuestion / isIntakeFieldAnswered", () => {
  it("asks conversational questions for known fields", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-academics-bloom-course-planner",
      name: "Bloom taxonomy course planner",
      prompt_template:
        "Course: {course}\nOutcomes: {outcomes}\nAudience: {audience}\nCredits: {credits}\nL:T:P: {ltp}",
      variables: ["course", "outcomes", "audience", "credits", "ltp"],
    })
    expect(fields.map((f) => f.name)).toEqual([
      "course",
      "outcomes",
      "audience",
      "credits",
      "ltp",
    ])
    expect(intakeFieldQuestion(fields[0])).toBe("What is the course title?")
    expect(intakeFieldQuestion(fields[1])).toContain("course outcomes")
  })

  it("tracks whether a step is answered", () => {
    const field = buildAssistantIntakeFields(courseBuilder)[0]
    expect(isIntakeFieldAnswered(field, { course: "" }, 0)).toBe(false)
    expect(isIntakeFieldAnswered(field, { course: "ML 101" }, 0)).toBe(true)
  })
})

describe("intakeSubmitLabel / hasFileField", () => {
  it("uses an upload label when a file field is present", () => {
    const fields = buildAssistantIntakeFields(syllabusAuditor)
    expect(hasFileField(fields)).toBe(true)
    expect(intakeSubmitLabel(fields)).toBe("Upload & Analyze")
  })

  it("uses a generate label for text-only assistants", () => {
    const fields = buildAssistantIntakeFields(courseBuilder)
    expect(hasFileField(fields)).toBe(false)
    expect(intakeSubmitLabel(fields)).toBe("Generate")
  })
})
