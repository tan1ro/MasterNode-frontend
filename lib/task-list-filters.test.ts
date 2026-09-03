import { describe, expect, it } from "vitest"
import {
  buildTaskStatusCounts,
  isActiveTaskStatus,
  taskMatchesStatusFilter,
} from "@/lib/task-list-filters"
import type { Task } from "@/types/api"

function task(status: Task["status"]): Task {
  return {
    task_id: "t1",
    task: "sample",
    status,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  }
}

describe("task-list-filters", () => {
  it("counts statuses", () => {
    const counts = buildTaskStatusCounts([
      task("running"),
      task("completed"),
      task("failed"),
      task("awaiting_human"),
      task("awaiting_plan_review"),
    ])
    expect(counts.total).toBe(5)
    expect(counts.active).toBe(3)
    expect(counts.completed).toBe(1)
    expect(counts.failed).toBe(1)
    expect(counts.review).toBe(2)
  })

  it("filters by status group", () => {
    expect(taskMatchesStatusFilter(task("running"), "active")).toBe(true)
    expect(taskMatchesStatusFilter(task("completed"), "active")).toBe(false)
    expect(taskMatchesStatusFilter(task("awaiting_plan_review"), "review")).toBe(true)
  })

  it("marks active statuses", () => {
    expect(isActiveTaskStatus("running")).toBe(true)
    expect(isActiveTaskStatus("completed")).toBe(false)
  })
})
