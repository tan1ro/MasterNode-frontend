import { describe, expect, it } from "vitest"
import {
  buildLlmContributionRows,
  formatLlmShareLabel,
} from "./task-stage-metrics"
import type { ExecutionMetricsRow } from "@/types/api"

describe("formatLlmShareLabel", () => {
  it("shows time-only share for default routing", () => {
    expect(formatLlmShareLabel(100, 0, { isDefault: true, llmCalls: 0 })).toBe("100%")
  })

  it("shows call share when provider has API usage", () => {
    expect(formatLlmShareLabel(0, 64, { llmCalls: 16 })).toBe("0% · 64% calls")
  })
})

describe("buildLlmContributionRows", () => {
  it("orders default first and splits time vs call share", () => {
    const metrics: ExecutionMetricsRow = {
      agent_executions: [
        { agent_id: "pipeline:master", provider: "", duration_seconds: 30.2, success: true },
        { agent_id: "pipeline:decomposer", provider: null, duration_seconds: 30.19, success: true },
        { agent_id: "repair_1_7d326907", provider: "gemini", duration_seconds: 4.2, success: true },
      ],
      provider_usage: {
        gemini: 16,
        mistral: 9,
      },
    }
    const partialResults = {
      repair_1_7d326907: {
        result: "Transformed the final_result structure into a valid map",
      },
    }

    const rows = buildLlmContributionRows(metrics, partialResults)
    expect(rows[0]?.provider).toBe("Default")
    expect(rows[0]?.isDefault).toBe(true)
    expect(rows[0]?.stageLabels).toEqual(["Master", "Decomposer"])
    expect(rows[0]?.stages).toBe(2)
    expect(rows[0]?.llmCalls).toBe(0)

    const gemini = rows.find((row) => row.provider === "GEMINI")
    expect(gemini?.stageEntries[0]?.title).toBe("Repair 1")
    expect(gemini?.stageEntries[0]?.detail).toBe(
      "Transformed the final_result structure into a valid map"
    )

    const mistral = rows.find((row) => row.provider === "MISTRAL")
    expect(gemini?.shareLabel).toBe("7% · 64% calls")
    expect(mistral?.shareLabel).toBe("0% · 36% calls")
    expect(gemini?.llmCalls).toBe(16)
    expect(mistral?.llmCalls).toBe(9)
  })

  it("attributes named providers to stages from stage_provider_calls", () => {
    const metrics: ExecutionMetricsRow = {
      agent_executions: [
        { agent_id: "pipeline:master", provider: "", duration_seconds: 12, success: true },
        { agent_id: "pipeline:decomposer", provider: "", duration_seconds: 8, success: true },
        {
          agent_id: "create_ppt_slides_content",
          provider: "Default",
          duration_seconds: 20,
          success: true,
        },
        { agent_id: "repair_1_abc", provider: "Default", duration_seconds: 4, success: true },
      ],
      provider_usage: {
        GEMINI: 4,
        MISTRAL: 9,
      },
      stage_provider_calls: {
        "pipeline:master": { GEMINI: 2 },
        "pipeline:decomposer": { MISTRAL: 3 },
        create_ppt_slides_content: { MISTRAL: 6 },
        repair_1_abc: { GEMINI: 2 },
      },
    }

    const rows = buildLlmContributionRows(metrics, {
      repair_1_abc: { result: "Fixed slide ordering" },
    })

    const gemini = rows.find((row) => row.provider === "GEMINI")
    const mistral = rows.find((row) => row.provider === "MISTRAL")
    const defaultRow = rows.find((row) => row.isDefault)

    expect(defaultRow?.stageLabels).toEqual(["Master", "Decomposer"])
    expect(gemini?.stageLabels).toEqual(["Master", "Repair 1"])
    expect(gemini?.stageEntries[1]?.detail).toContain("Fixed slide ordering")
    expect(mistral?.stageLabels).toEqual(["Decomposer", "Create PPT Slides Content"])
    expect(gemini?.stageEntries[0]?.detail).toContain("2 API calls")
    expect(mistral?.stageEntries[1]?.detail).toContain("6 API calls")
  })
})
