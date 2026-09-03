import { describe, expect, it } from "vitest"
import {
  buildMilestonesFromGraph,
  countPipelineStageProgress,
  formatTaskRunElapsed,
  getPipelineDisplayMilestones,
} from "./task-live-execution"
import type { Task } from "@/types/api"

function baseTask(overrides: Partial<Task>): Task {
  return {
    task_id: "t1",
    task: "demo",
    status: "running",
    created_at: "2026-06-02T10:00:00.000Z",
    updated_at: "2026-06-02T10:00:00.000Z",
    ...overrides,
  }
}

describe("formatTaskRunElapsed", () => {
  it("starts from zero before execution starts", () => {
    const task = baseTask({ status: "pending" })
    const out = formatTaskRunElapsed(task, Date.parse("2026-06-02T10:20:00.000Z"))
    expect(out).toBe("0s")
  })

  it("prefers graph started_at over created_at", () => {
    const task = baseTask({
      created_at: "2026-06-02T10:00:00.000Z",
      graph: {
        nodes: {
          "pipeline:master": {
            status: "completed",
            started_at: "2026-06-02T10:15:00.000Z",
            completed_at: "2026-06-02T10:16:00.000Z",
          },
        },
      },
    })
    const out = formatTaskRunElapsed(task, Date.parse("2026-06-02T10:20:00.000Z"))
    expect(out).toBe("5m")
  })

  it("builds five pipeline stages with master running when task is active", () => {
    const rows = buildMilestonesFromGraph(undefined, undefined, "running")
    expect(getPipelineDisplayMilestones(rows)).toHaveLength(5)
    expect(rows[0]).toMatchObject({ id: "pipeline:master", status: "running" })
    const { done, total } = countPipelineStageProgress(rows, "running")
    expect(total).toBe(5)
    expect(done).toBe(0)
  })

  it("does not use stale created_at for active runs without graph timestamps", () => {
    const now = Date.parse("2026-06-02T15:30:00.000Z")
    const task = baseTask({
      status: "running",
      created_at: "2026-06-02T10:00:00.000Z",
      updated_at: "2026-06-02T10:00:00.000Z",
    })
    expect(formatTaskRunElapsed(task, now)).toBe("0s")
    const anchor = now - 45_000
    expect(formatTaskRunElapsed(task, now, null, { liveAnchorMs: anchor })).toBe("45s")
  })
})

