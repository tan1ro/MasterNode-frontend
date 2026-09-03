import { describe, expect, it } from "vitest"
import {
  CHAT_PIPELINE_EXECUTION_MODE,
  CHAT_PIPELINE_HUMAN_IN_LOOP,
  clampMaxParallelAgents,
  resolvePlanMaxParallelAgents,
} from "@/lib/pipeline-task-defaults"
import { buildCreateTaskDefaults } from "@/lib/settings-preferences"

describe("pipeline-task-defaults", () => {
  it("maps plan to parallel agent cap", () => {
    expect(resolvePlanMaxParallelAgents("free")).toBe(4)
    expect(resolvePlanMaxParallelAgents("pro")).toBe(8)
    expect(resolvePlanMaxParallelAgents("premium")).toBe(60)
  })

  it("clamps requested agents to plan cap", () => {
    expect(clampMaxParallelAgents(32, "free")).toBe(4)
    expect(clampMaxParallelAgents(2, "pro")).toBe(2)
  })
})

describe("buildCreateTaskDefaults chat pipeline", () => {
  it("uses parallel mode and plan cap by default", () => {
    const body = buildCreateTaskDefaults({ task: "analyze repo" })
    expect(body.execution_mode).toBe(CHAT_PIPELINE_EXECUTION_MODE)
    expect(body.max_parallel_agents).toBeGreaterThan(0)
    expect(body.human_in_loop).toBe(true)
  })

  it("forces human-in-the-loop for chat-launched tasks", () => {
    const body = buildCreateTaskDefaults({
      task: "ship feature",
      source_conversation_id: "conv-1",
    })
    expect(body.human_in_loop).toBe(CHAT_PIPELINE_HUMAN_IN_LOOP)
    expect(body.execution_mode).toBe("parallel")
  })
})
