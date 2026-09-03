import { describe, expect, it } from "vitest"
import { compareTasks, sortTasks } from "./task-list-sort"
import type { Task } from "@/types/api"

function task(partial: Partial<Task> & Pick<Task, "task_id" | "task">): Task {
  return {
    status: "completed",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...partial,
  }
}

describe("compareTasks", () => {
  it("sorts by name case-insensitively", () => {
    const a = task({ task_id: "a", task: "Alpha task" })
    const b = task({ task_id: "b", task: "beta task" })
    expect(compareTasks(a, b, "name")).toBeLessThan(0)
  })

  it("sorts by created and updated timestamps", () => {
    const older = task({
      task_id: "old",
      task: "Old",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })
    const newer = task({
      task_id: "new",
      task: "New",
      created_at: "2026-06-01T00:00:00Z",
      updated_at: "2026-06-02T00:00:00Z",
    })
    expect(compareTasks(older, newer, "created")).toBeLessThan(0)
    expect(compareTasks(older, newer, "updated")).toBeLessThan(0)
  })
})

describe("sortTasks", () => {
  it("applies descending order for dates", () => {
    const rows = sortTasks(
      [
        task({ task_id: "1", task: "One", created_at: "2026-01-01T00:00:00Z" }),
        task({ task_id: "2", task: "Two", created_at: "2026-06-01T00:00:00Z" }),
      ],
      "created",
      "desc"
    )
    expect(rows.map((row) => row.task_id)).toEqual(["2", "1"])
  })
})
