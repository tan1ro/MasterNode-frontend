import { describe, expect, it } from "vitest"
import { resolveParallelAgentLabel } from "./parallel-agent-labels"

describe("resolveParallelAgentLabel", () => {
  it("humanizes parallel worker ids", () => {
    expect(resolveParallelAgentLabel("create_ppt_slides_content").title).toBe(
      "Create PPT Slides Content"
    )
    expect(resolveParallelAgentLabel("research_full_stack_tech").title).toBe(
      "Research Full Stack Tech"
    )
  })

  it("shows repair index and fix summary from partial_results", () => {
    const entry = resolveParallelAgentLabel("repair_1_7d326907", {
      repair_1_7d326907: {
        result: "Transformed the final_result structure into a valid map",
      },
    })
    expect(entry.title).toBe("Repair 1")
    expect(entry.kind).toBe("repair")
    expect(entry.detail).toBe("Transformed the final_result structure into a valid map")
  })

  it("labels pipeline stages", () => {
    expect(resolveParallelAgentLabel("pipeline:master").title).toBe("Master")
    expect(resolveParallelAgentLabel("pipeline:master").kind).toBe("pipeline")
  })
})
