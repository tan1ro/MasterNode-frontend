import { describe, expect, it } from "vitest"
import {
  getCreatorTaskRunPhase,
  getCreatorTaskStatusCopy,
  resolveCreatorTaskDeliverables,
} from "@/lib/creator-task-experience"
import type { Task } from "@/types/api"

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    task_id: "task-1",
    task: "Write a one-page summary of quantum computing.",
    status: "completed",
    created_at: "2026-06-30T12:00:00Z",
    updated_at: "2026-06-30T12:05:00Z",
    ...overrides,
  } as Task
}

describe("creator-task-experience", () => {
  it("maps creator run phases from task status", () => {
    expect(getCreatorTaskRunPhase("running")).toBe("active")
    expect(getCreatorTaskRunPhase("awaiting_plan_review")).toBe("review")
    expect(getCreatorTaskRunPhase("completed")).toBe("completed")
    expect(getCreatorTaskRunPhase("failed")).toBe("failed")
  })

  it("returns friendly status copy for creators", () => {
    expect(getCreatorTaskStatusCopy("running").label).toBe("Working on it")
    expect(getCreatorTaskStatusCopy("awaiting_plan_review").label).toBe("Waiting on you")
  })

  it("resolves deliverables from completed task output", () => {
    const task = makeTask({
      final_result: {
        final_result: "# Quantum summary\n\nQuantum computing uses qubits.",
        document_markdown: "# Quantum summary\n\nQuantum computing uses qubits.",
        document_title: "Quantum summary",
      },
    })

    const deliverables = resolveCreatorTaskDeliverables(task)
    expect(deliverables.documentBundle?.title).toBe("Quantum summary")
    expect(deliverables.summaryReport?.summary).toContain("Quantum")
  })
})
