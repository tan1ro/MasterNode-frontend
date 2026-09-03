import { describe, expect, it } from "vitest"
import { derivePipelineProgressFromEvent } from "./pipeline-progress"

describe("derivePipelineProgressFromEvent", () => {
  it("uses pipeline payload when available", () => {
    const result = derivePipelineProgressFromEvent({
      type: "progress",
      step: "decomposer",
      pipeline: {
        current_stage: "decomposer",
        stage_status: "running",
        subtask_count: 3,
        execution_order_count: 3,
        parallel_summary: { total: 3, running: 1, completed: 1, failed: 0 },
      },
    })
    expect(result.current_stage).toBe("decomposer")
    expect(result.subtask_count).toBe(3)
    expect(result.parallel_summary.total).toBe(3)
  })

  it("falls back to graph and partial results when pipeline is missing", () => {
    const result = derivePipelineProgressFromEvent({
      type: "progress",
      step: "parallel_execution",
      partial_results: { a: { ok: true }, b: { ok: true } },
      graph: {
        nodes: {
          a: { status: "completed" },
          b: { status: "running" },
          __parallel__: { status: "running" },
        },
      },
    })
    expect(result.current_stage).toBe("parallel_execution")
    expect(result.subtask_count).toBe(2)
    expect(result.parallel_summary.total).toBe(2)
    expect(result.parallel_summary.running).toBe(1)
    expect(result.parallel_summary.completed).toBe(1)
  })
})
