import type { ExecutionMetricsRow, Task } from "@/types/api"

export type DashboardRangePreset = "7d" | "15d" | "30d" | "3m" | "1y"

export const DASHBOARD_RANGE_PRESETS: {
  id: DashboardRangePreset
  label: string
  days: number
}[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "15d", label: "Last 15 days", days: 15 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "3m", label: "Last 3 months", days: 90 },
  { id: "1y", label: "Last year", days: 365 },
]

export function presetDays(id: DashboardRangePreset): number {
  return DASHBOARD_RANGE_PRESETS.find((p) => p.id === id)?.days ?? 7
}

/** Start of local day (today − (days − 1)), inclusive window of `days` calendar days through end of today. */
export function rangeStartCutoff(days: number, now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d
}

export function filterTasksFromCutoff(tasks: Task[], cutoff: Date): Task[] {
  const t = cutoff.getTime()
  return tasks.filter((task) => new Date(task.created_at).getTime() >= t)
}

function volumeBucketKind(dayCount: number): "day" | "week" | "month" {
  if (dayCount <= 31) return "day"
  if (dayCount <= 120) return "week"
  return "month"
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString(undefined, { month: "short", year: "numeric" })
}

/** Tasks over time inside the selected range (daily / weekly / monthly buckets). */
export function buildTasksVolumeSeries(
  tasksInRange: Task[],
  dayCount: number,
  now = new Date()
): { label: string; tasks: number }[] {
  const startCutoff = rangeStartCutoff(dayCount, now)
  const kind = volumeBucketKind(dayCount)
  const endMs = now.getTime()

  if (kind === "day") {
    const rows: { key: string; label: string; tasks: number }[] = []
    for (let i = 0; i < dayCount; i++) {
      const day = new Date(startCutoff)
      day.setDate(startCutoff.getDate() + i)
      if (day.getTime() > endMs) break
      const key = day.toISOString().slice(0, 10)
      const label =
        dayCount <= 14
          ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]
          : formatShortDate(day)
      rows.push({ key, label, tasks: 0 })
    }
    const byKey = new Map(rows.map((r) => [r.key, r]))
    for (const task of tasksInRange) {
      const key = new Date(task.created_at).toISOString().slice(0, 10)
      const row = byKey.get(key)
      if (row) row.tasks += 1
    }
    return rows.map(({ label, tasks }) => ({ label, tasks }))
  }

  if (kind === "week") {
    const numWeeks = Math.max(1, Math.ceil(dayCount / 7))
    const counts = Array.from({ length: numWeeks }, () => 0)
    const weekStart = (i: number) => {
      const d = new Date(startCutoff)
      d.setDate(startCutoff.getDate() + i * 7)
      return d
    }
    for (const task of tasksInRange) {
      const ms = new Date(task.created_at).getTime() - startCutoff.getTime()
      const wi = Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
      if (wi >= 0 && wi < numWeeks) counts[wi] += 1
    }
    return counts.map((tasks, i) => ({
      label: formatShortDate(weekStart(i)),
      tasks,
    }))
  }

  const keys: string[] = []
  const cur = new Date(startCutoff.getFullYear(), startCutoff.getMonth(), 1)
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  while (cur <= endMonth) {
    keys.push(monthKey(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  const counts = new Map(keys.map((k) => [k, 0]))
  for (const task of tasksInRange) {
    const k = monthKey(new Date(task.created_at))
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return keys.map((k) => ({ label: monthLabel(k), tasks: counts.get(k) ?? 0 }))
}

/** Same buckets as task volume; ``day`` is the chart X label (week/month use short labels). */
export function buildExecutionFailureVolumeSeries(
  tasksInRange: Task[],
  dayCount: number,
  now = new Date()
): { day: string; executions: number; failedTasks: number }[] {
  const startCutoff = rangeStartCutoff(dayCount, now)
  const kind = volumeBucketKind(dayCount)
  const endMs = now.getTime()

  if (kind === "day") {
    const rows: {
      key: string
      label: string
      executions: number
      failedTasks: number
    }[] = []
    for (let i = 0; i < dayCount; i++) {
      const day = new Date(startCutoff)
      day.setDate(startCutoff.getDate() + i)
      if (day.getTime() > endMs) break
      const key = day.toISOString().slice(0, 10)
      const label =
        dayCount <= 14
          ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]
          : formatShortDate(day)
      rows.push({ key, label, executions: 0, failedTasks: 0 })
    }
    const byKey = new Map(rows.map((r) => [r.key, r]))
    for (const task of tasksInRange) {
      const key = new Date(task.created_at).toISOString().slice(0, 10)
      const row = byKey.get(key)
      if (!row) continue
      row.executions += 1
      if (task.status === "failed") row.failedTasks += 1
    }
    return rows.map(({ label, executions, failedTasks }) => ({
      day: label,
      executions,
      failedTasks,
    }))
  }

  if (kind === "week") {
    const numWeeks = Math.max(1, Math.ceil(dayCount / 7))
    const counts = Array.from({ length: numWeeks }, () => ({ executions: 0, failedTasks: 0 }))
    const weekStart = (i: number) => {
      const d = new Date(startCutoff)
      d.setDate(startCutoff.getDate() + i * 7)
      return d
    }
    for (const task of tasksInRange) {
      const ms = new Date(task.created_at).getTime() - startCutoff.getTime()
      const wi = Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
      if (wi < 0 || wi >= numWeeks) continue
      counts[wi].executions += 1
      if (task.status === "failed") counts[wi].failedTasks += 1
    }
    return counts.map((c, i) => ({
      day: formatShortDate(weekStart(i)),
      executions: c.executions,
      failedTasks: c.failedTasks,
    }))
  }

  const keys: string[] = []
  const cur = new Date(startCutoff.getFullYear(), startCutoff.getMonth(), 1)
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  while (cur <= endMonth) {
    keys.push(monthKey(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  const counts = new Map(keys.map((k) => [k, { executions: 0, failedTasks: 0 }]))
  for (const task of tasksInRange) {
    const k = monthKey(new Date(task.created_at))
    const cell = counts.get(k)
    if (!cell) continue
    cell.executions += 1
    if (task.status === "failed") cell.failedTasks += 1
  }
  return keys.map((k) => ({
    day: monthLabel(k),
    executions: counts.get(k)!.executions,
    failedTasks: counts.get(k)!.failedTasks,
  }))
}

export function volumeSeriesHint(dayCount: number): string {
  const k = volumeBucketKind(dayCount)
  if (k === "day") return "Daily counts"
  if (k === "week") return "Weekly totals"
  return "Monthly totals"
}

export function metricsRowsInRange(
  rows: ExecutionMetricsRow[],
  tasks: Task[],
  cutoff: Date
): ExecutionMetricsRow[] {
  const cutoffMs = cutoff.getTime()
  const taskTimes = new Map(
    tasks.map((t) => [t.task_id, new Date(t.created_at).getTime()] as const)
  )
  return rows.filter((row) => {
    const ts = taskTimes.get(row.task_id)
    return ts !== undefined && ts >= cutoffMs
  })
}
