import type { ExecutionMetricsRow, Task } from "@/types/api"
import { describe, expect, it } from "vitest"
import {
  buildExecutionFailureVolumeSeries,
  buildTasksVolumeSeries,
  DASHBOARD_RANGE_PRESETS,
  filterTasksFromCutoff,
  metricsRowsInRange,
  presetDays,
  rangeStartCutoff,
  volumeSeriesHint,
} from "./dashboard-time-range"

function task(id: string, created: string, status: Task["status"] = "completed"): Task {
  return {
    task_id: id,
    task: "t",
    status,
    created_at: created,
    updated_at: created,
  }
}

describe("dashboard-time-range", () => {
  it("presetDays matches table", () => {
    for (const p of DASHBOARD_RANGE_PRESETS) {
      expect(presetDays(p.id)).toBe(p.days)
    }
    expect(presetDays("7d")).toBe(7)
  })

  it("rangeStartCutoff is local midnight and steps back (days − 1)", () => {
    const now = new Date(2026, 2, 10, 15, 0, 0) // Mar 10 local
    const start = rangeStartCutoff(7, now)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getDate()).toBe(4)
    expect(start.getMonth()).toBe(2)
  })

  it("filterTasksFromCutoff keeps tasks on or after cutoff", () => {
    const cutoff = new Date("2026-01-05T00:00:00Z")
    const tasks: Task[] = [
      task("a", "2026-01-04T12:00:00Z"),
      task("b", "2026-01-05T00:00:00Z"),
    ]
    const out = filterTasksFromCutoff(tasks, cutoff)
    expect(out.map((t) => t.task_id)).toEqual(["b"])
  })

  it("buildTasksVolumeSeries counts tasks that fall in daily buckets", () => {
    const now = new Date(2026, 3, 18, 15, 0, 0)
    const startCutoff = rangeStartCutoff(7, now)
    const dayInRange = new Date(startCutoff)
    dayInRange.setDate(startCutoff.getDate() + 2)
    const iso = dayInRange.toISOString()
    const tasks = [task("1", iso), task("2", iso)]
    const series = buildTasksVolumeSeries(tasks, 7, now)
    const total = series.reduce((s, r) => s + r.tasks, 0)
    expect(total).toBe(2)
    expect(series.length).toBeGreaterThan(0)
  })

  it("buildExecutionFailureVolumeSeries counts failures in daily buckets", () => {
    const now = new Date(2026, 3, 18, 15, 0, 0)
    const startCutoff = rangeStartCutoff(7, now)
    const dayInRange = new Date(startCutoff)
    dayInRange.setDate(startCutoff.getDate() + 2)
    const iso = dayInRange.toISOString()
    const tasks = [task("1", iso, "completed"), task("2", iso, "failed"), task("3", iso, "failed")]
    const series = buildExecutionFailureVolumeSeries(tasks, 7, now)
    const totalExec = series.reduce((s, r) => s + r.executions, 0)
    const totalFail = series.reduce((s, r) => s + r.failedTasks, 0)
    expect(totalExec).toBe(3)
    expect(totalFail).toBe(2)
  })

  it("volumeSeriesHint reflects bucket kind", () => {
    expect(volumeSeriesHint(7)).toBe("Daily counts")
    expect(volumeSeriesHint(60)).toBe("Weekly totals")
    expect(volumeSeriesHint(200)).toBe("Monthly totals")
  })

  it("metricsRowsInRange filters by task created_at", () => {
    const cutoff = new Date("2026-04-01T00:00:00Z")
    const tasks: Task[] = [task("t1", "2026-03-15T00:00:00Z"), task("t2", "2026-04-02T00:00:00Z")]
    const rows: ExecutionMetricsRow[] = [
      { task_id: "t1", total_tokens: 1 },
      { task_id: "t2", total_tokens: 2 },
    ]
    const filtered = metricsRowsInRange(rows, tasks, cutoff)
    expect(filtered.map((r) => r.task_id)).toEqual(["t2"])
  })
})
