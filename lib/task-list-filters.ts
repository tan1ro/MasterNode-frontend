import type { Task } from "@/types/api"

export type TaskStatusFilter = "all" | "active" | "completed" | "failed" | "review"

const ACTIVE_STATUSES = new Set<Task["status"]>([
  "pending",
  "decomposing",
  "running",
  "awaiting_human",
  "awaiting_plan_review",
])

const REVIEW_STATUSES = new Set<Task["status"]>(["awaiting_human", "awaiting_plan_review"])

export function isActiveTaskStatus(status: Task["status"]): boolean {
  return ACTIVE_STATUSES.has(status)
}

export function buildTaskStatusCounts(tasks: Task[]) {
  let active = 0
  let completed = 0
  let failed = 0
  let review = 0

  for (const task of tasks) {
    if (ACTIVE_STATUSES.has(task.status)) active += 1
    if (task.status === "completed") completed += 1
    if (task.status === "failed") failed += 1
    if (REVIEW_STATUSES.has(task.status)) review += 1
  }

  return {
    total: tasks.length,
    active,
    completed,
    failed,
    review,
  }
}

export function taskMatchesStatusFilter(task: Task, filter: TaskStatusFilter): boolean {
  if (filter === "all") return true
  if (filter === "active") return ACTIVE_STATUSES.has(task.status)
  if (filter === "completed") return task.status === "completed"
  if (filter === "failed") return task.status === "failed"
  if (filter === "review") return REVIEW_STATUSES.has(task.status)
  return true
}
