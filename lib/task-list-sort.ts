import { getTaskShortLabel } from "@/lib/task-display"
import { parseApiTimestamp } from "@/lib/datetime-local"
import type { Task } from "@/types/api"

export type TaskListSortKey = "name" | "created" | "updated"
export type TaskListSortDir = "asc" | "desc"

export const TASK_LIST_SORT_LABELS: Record<TaskListSortKey, string> = {
  name: "Name",
  created: "Created",
  updated: "Updated",
}

function taskTimestamp(value: string | undefined): number {
  const parsed = parseApiTimestamp(value ?? "")
  return parsed ? parsed.getTime() : 0
}

export function compareTasks(a: Task, b: Task, sortKey: TaskListSortKey): number {
  switch (sortKey) {
    case "name":
      return getTaskShortLabel(a.task).localeCompare(getTaskShortLabel(b.task), undefined, {
        sensitivity: "base",
      })
    case "created":
      return taskTimestamp(a.created_at) - taskTimestamp(b.created_at)
    case "updated":
      return taskTimestamp(a.updated_at) - taskTimestamp(b.updated_at)
    default:
      return 0
  }
}

export function sortTasks(
  tasks: Task[],
  sortKey: TaskListSortKey,
  sortDir: TaskListSortDir
): Task[] {
  const dir = sortDir === "asc" ? 1 : -1
  return [...tasks].sort((a, b) => dir * compareTasks(a, b, sortKey))
}

export function nextTaskListSort(
  currentKey: TaskListSortKey,
  currentDir: TaskListSortDir,
  nextKey: TaskListSortKey
): { sortKey: TaskListSortKey; sortDir: TaskListSortDir } {
  if (currentKey === nextKey) {
    return { sortKey: nextKey, sortDir: currentDir === "asc" ? "desc" : "asc" }
  }
  const defaultDesc: TaskListSortKey[] = ["created", "updated"]
  return {
    sortKey: nextKey,
    sortDir: defaultDesc.includes(nextKey) ? "desc" : "asc",
  }
}

const SORT_OPTION_LABELS: Record<`${TaskListSortKey}:${TaskListSortDir}`, string> = {
  "name:asc": "Name (A→Z)",
  "name:desc": "Name (Z→A)",
  "created:asc": "Created (oldest first)",
  "created:desc": "Created (newest first)",
  "updated:asc": "Updated (oldest first)",
  "updated:desc": "Updated (newest first)",
}

export function taskListSortOptionLabel(key: TaskListSortKey, dir: TaskListSortDir): string {
  return SORT_OPTION_LABELS[`${key}:${dir}`]
}

export const TASK_LIST_SORT_OPTIONS: { key: TaskListSortKey; dir: TaskListSortDir }[] = (
  Object.keys(TASK_LIST_SORT_LABELS) as TaskListSortKey[]
).flatMap((key) => [
  { key, dir: "asc" as const },
  { key, dir: "desc" as const },
])
