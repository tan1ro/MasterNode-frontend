import { describe, expect, it } from "vitest"
import { buildAssistantIntakeFields } from "@/lib/assistant-intake"
import { resolveIntakeFieldNames } from "@/lib/assistant-intake-profiles"
import {
  allIntakeFieldsAnswered,
  buildIntakeContextMessages,
  prefillIntakeValues,
  unansweredIntakeFields,
} from "@/lib/assistant-intake-prefill"
import type { AgentTemplateApi } from "@/types/api"

const bloomPlanner: AgentTemplateApi = {
  template_id: "sample-academics-bloom-course-planner",
  name: "Bloom taxonomy course planner",
  prompt_template:
    "Course: {course}\nOutcomes: {outcomes}\nAudience: {audience}\nCredits: {credits}\nL:T:P: {ltp}",
  variables: ["course", "outcomes", "audience", "credits", "ltp"],
}

describe("resolveIntakeFieldNames", () => {
  it("expands bloom planner to full course planning fields", () => {
    expect(resolveIntakeFieldNames(bloomPlanner)).toEqual([
      "course",
      "outcomes",
      "audience",
      "credits",
      "ltp",
    ])
  })
})

describe("prefillIntakeValues", () => {
  it("fills course title from a single-line message and skips re-asking it", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(fields, "Introduction to Machine Learning")
    expect(values.course).toBe("Introduction to Machine Learning")
    expect(unansweredIntakeFields(fields, values, 0).map((f) => f.name)).toEqual([
      "outcomes",
      "audience",
      "credits",
      "ltp",
    ])
  })

  it("parses labeled fields from the user message", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(
      fields,
      "Course title: Data Structures\nCredits: 4\nL:T:P - 3:1:0"
    )
    expect(values.course).toBe("Data Structures")
    expect(values.credits).toBe("4")
    expect(values.ltp).toBe("3:1:0")
    expect(unansweredIntakeFields(fields, values, 0).map((f) => f.name)).toEqual([
      "outcomes",
      "audience",
    ])
  })

  it("detects when every field is already answered", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(
      fields,
      [
        "Course: Algorithms",
        "Outcomes: CO1 analyze complexity; CO2 design algorithms",
        "Audience: B.Tech CSE year 3",
        "Credits: 3",
        "L:T:P: 2:0:2",
      ].join("\n")
    )
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })

  it("pulls course title from chat history when the latest message is a generic command", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(fields, "generate the plan", [
      "Introduction to Machine Learning",
    ])
    expect(values.course).toBe("Introduction to Machine Learning")
    expect(unansweredIntakeFields(fields, values, 0).map((f) => f.name)).not.toContain(
      "course"
    )
  })

  it("extracts title from the first line when followed by a generate command", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(
      fields,
      "Data Structures\nPlease generate the bloom course plan"
    )
    expect(values.course).toBe("Data Structures")
  })

  it("extracts course title from natural phrasing", () => {
    const fields = buildAssistantIntakeFields(bloomPlanner)
    const values = prefillIntakeValues(
      fields,
      "Create a bloom taxonomy course plan for Introduction to Machine Learning"
    )
    expect(values.course).toBe("Introduction to Machine Learning")
  })

  it("resolves TECHM to Tech Mahindra for market intel assistants", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-market-intel-engine",
      name: "Market intelligence",
      prompt_template: "Market: {market}\nProduct: {product}\nGeo: {geo}\nGoal: {goal}",
      variables: ["market", "product", "geo", "goal"],
    })
    const values = prefillIntakeValues(fields, "TECHM")
    expect(values.product).toBe("Tech Mahindra")
    expect(values.market).toBe("IT services & consulting")
    expect(values.geo).toBe("India")
  })

  it("does not dump vague writeup prompts into market fields", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-market-intel-engine",
      name: "Market intelligence",
      prompt_template: "Market: {market}\nProduct: {product}\nGeo: {geo}\nGoal: {goal}",
      variables: ["market", "product", "geo", "goal"],
    })
    const values = prefillIntakeValues(fields, "Tell me about it based on writeup")
    expect(values).toEqual({})
  })

  it("buildIntakeContextMessages returns recent user lines oldest-first", () => {
    expect(
      buildIntakeContextMessages([
        { role: "user", content: "  Hello  " },
        { role: "assistant", content: "Hi" },
        { role: "user", content: "World" },
      ])
    ).toEqual(["Hello", "World"])
  })
})

const summarizer: AgentTemplateApi = {
  template_id: "sample-custom-summarizer",
  name: "Summarizer",
  prompt_template:
    "Summarize the following for a busy reader: bullet key points, one-line takeaway, and note anything ambiguous. Content:\n{content}",
  variables: ["content"],
}

describe("prefillIntakeValues — paste body fields", () => {
  it("fills summarizer content from a multi-line paste and skips intake", () => {
    const fields = buildAssistantIntakeFields(summarizer)
    const values = prefillIntakeValues(
      fields,
      "Summarize the following:\n\nMachine learning is a subset of AI.\nIt learns patterns from data.\nApplications span vision, language, and robotics."
    )
    expect(values.content).toContain("Machine learning")
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })

  it("fills summarizer content from a long single paragraph", () => {
    const fields = buildAssistantIntakeFields(summarizer)
    const paragraph =
      "The Indian Constitution establishes a federal structure with a strong centre, fundamental rights, directive principles, and an independent judiciary that guards democratic values across decades of amendment and interpretation."
    const values = prefillIntakeValues(fields, paragraph)
    expect(values.content).toBe(paragraph)
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })

  it("does not treat a bare summarize command as content", () => {
    const fields = buildAssistantIntakeFields(summarizer)
    const values = prefillIntakeValues(fields, "summarize this")
    expect(values.content).toBeUndefined()
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(false)
  })

  it("extracts fenced code for code review assistants", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-custom-code-review",
      name: "Code review",
      prompt_template: "Review:\n{code}\nContext: {context}",
      variables: ["code", "context"],
    })
    const values = prefillIntakeValues(
      fields,
      "Please review this code:\n```python\ndef add(a, b):\n    return a + b\n```"
    )
    expect(values.code).toContain("def add")
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })
})

const rfpResponse: AgentTemplateApi = {
  template_id: "sample-sales-rfp-response",
  name: "RFP / RFI response",
  prompt_template:
    "Respond to RFP/RFI.\nRFP summary: {rfp}\nSolution: {solution}\nDeadline: {deadline}",
  variables: ["rfp", "solution", "deadline"],
}

describe("prefillIntakeValues — labeled assistant messages", () => {
  it("does not treat want it rfi as an RFP field value", () => {
    const fields = buildAssistantIntakeFields(rfpResponse)
    const values = prefillIntakeValues(fields, "want it rfi")
    expect(values.rfp).toBeUndefined()
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(false)
  })

  it("rejects vague RFP labeled lines", () => {
    const fields = buildAssistantIntakeFields(rfpResponse)
    const values = prefillIntakeValues(fields, "RFP: I want for my project here")
    expect(values.rfp).toBeUndefined()
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(false)
    expect(unansweredIntakeFields(fields, values, 0).map((f) => f.name)).toEqual([
      "rfp",
      "solution",
      "deadline",
    ])
  })

  it("prefills all RFP response fields from a multi-line labeled message", () => {
    const fields = buildAssistantIntakeFields(rfpResponse)
    const values = prefillIntakeValues(
      fields,
      [
        "RFP: Cloud migration tender for state agency",
        "Solution: Hybrid Azure landing zone with managed SOC",
        "Deadline: March 15, 2026",
      ].join("\n")
    )
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })

  it("prefills contract risk lens from labeled contract line", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-legal-contract-risk-lens",
      name: "Contract risk lens",
      prompt_template: "Review contract.\nContract: {contract}\nRole: {role}",
      variables: ["contract", "role", "commercial", "context"],
    })
    const values = prefillIntakeValues(
      fields,
      "Contract: Standard MSA with unlimited liability carve-out"
    )
    expect(values.contract).toBe("Standard MSA with unlimited liability carve-out")
  })

  it("prefills discovery facilitator from labeled prospect and product", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-sales-discovery-facilitator",
      name: "Discovery call facilitation",
      prompt_template: "Prospect: {prospect}\nProduct: {product}\nStage: {stage}",
      variables: ["prospect", "product", "stage"],
    })
    const values = prefillIntakeValues(
      fields,
      "Prospect: Acme Corp\nProduct: DataCloud Analytics\nStage: discovery"
    )
    expect(values.prospect).toBe("Acme Corp")
    expect(values.product).toBe("DataCloud Analytics")
    expect(values.stage).toBe("discovery")
  })

  it("matches underscore field names from spaced labels", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-finance-cashflow",
      name: "Cash flow",
      prompt_template: "Opening: {opening_cash}",
      variables: ["opening_cash", "inflows", "outflows"],
    })
    const values = prefillIntakeValues(fields, "Opening cash: 250000")
    expect(values.opening_cash).toBe("250000")
  })

  it("prefills proposal SOW fields from labeled deal scope pricing", () => {
    const fields = buildAssistantIntakeFields({
      template_id: "sample-sales-proposal-sow",
      name: "Proposal & SOW drafting",
      prompt_template: "Deal: {deal}\nScope: {scope}\nPricing: {pricing}",
      variables: ["deal", "scope", "pricing"],
    })
    const values = prefillIntakeValues(
      fields,
      "Deal: Acme ERP rollout\nScope: Phase 1 finance modules\nPricing: $1.2M fixed fee"
    )
    expect(allIntakeFieldsAnswered(fields, values, 0)).toBe(true)
  })
})
