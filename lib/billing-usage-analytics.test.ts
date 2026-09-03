import { describe, expect, it } from "vitest"
import {
  buildStackedCreditsByChannel,
  buildStackedCreditsByModel,
  exportUsageRecordsCsv,
  formatTokensShort,
  providerLabel,
} from "./billing-usage-analytics"
import type { ExecutionMetricsRow, Task, UsageRecord } from "@/types/api"

describe("billing-usage-analytics", () => {
  it("formats token counts compactly", () => {
    expect(formatTokensShort(1_500_000)).toBe("1.5M")
    expect(formatTokensShort(269_000)).toBe("269K")
  })

  it("builds stacked channel series from usage records", () => {
    const day = new Date()
    day.setHours(12, 0, 0, 0)
    const iso = day.toISOString()
    const records: UsageRecord[] = [
      {
        usage_id: "1",
        created_at: iso,
        tokens_used: 1000,
        client_channel: "web",
      },
      {
        usage_id: "2",
        created_at: iso,
        tokens_used: 500,
        client_channel: "api",
      },
    ]
    const chart = buildStackedCreditsByChannel({ records, rangeDays: 30 })
    expect(chart.seriesKeys.sort()).toEqual(["api", "web"])
    expect(chart.data.length).toBeGreaterThan(0)
  })

  it("builds stacked model series from task metrics", () => {
    const day = new Date()
    day.setHours(12, 0, 0, 0)
    const iso = day.toISOString()
    const tasks: Task[] = [
      {
        task_id: "t1",
        task: "demo",
        status: "completed",
        created_at: iso,
        updated_at: iso,
        client_channel: "web",
      },
    ]
    const metricsRows: ExecutionMetricsRow[] = [
      {
        task_id: "t1",
        total_tokens: 2000,
        provider_usage: { OPENAI: 3, ANTHROPIC: 1 },
      },
    ]
    const chart = buildStackedCreditsByModel({ tasks, metricsRows, rangeDays: 30 })
    expect(chart.seriesKeys.length).toBeGreaterThan(0)
    expect(chart.data[0]?.date).toBeTruthy()
  })

  it("labels providers for legend display", () => {
    expect(providerLabel("OPENAI")).toBe("OpenAI")
    expect(providerLabel("DEFAULT")).toBe("Auto / mixed")
  })

  it("exports usage csv with header row", () => {
    const csv = exportUsageRecordsCsv([
      {
        usage_id: "u1",
        created_at: "2026-03-01T10:00:00.000Z",
        task_id: "t1",
        tokens_used: 42,
        cost_usd: 0.01,
        client_channel: "web",
      },
    ])
    expect(csv.split("\n")[0]).toContain("task_id")
    expect(csv).toContain("t1")
  })
})
