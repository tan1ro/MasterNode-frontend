"use client"

import type { TaskListSortDir, TaskListSortKey } from "@/lib/task-list-sort"

export type TaskListViewMode = "cards" | "list"

const STORAGE_KEY = "pref_task_list_ui"

export interface TaskListUiPreferences {
  viewMode: TaskListViewMode
  sortKey: TaskListSortKey
  sortDir: TaskListSortDir
}

const DEFAULT_PREFERENCES: TaskListUiPreferences = {
  viewMode: "cards",
  sortKey: "created",
  sortDir: "desc",
}

function isViewMode(value: unknown): value is TaskListViewMode {
  return value === "cards" || value === "list"
}

function isSortKey(value: unknown): value is TaskListSortKey {
  return value === "name" || value === "created" || value === "updated"
}

function isSortDir(value: unknown): value is TaskListSortDir {
  return value === "asc" || value === "desc"
}

export function loadTaskListUiPreferences(): TaskListUiPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<TaskListUiPreferences>
    return {
      viewMode: isViewMode(parsed.viewMode) ? parsed.viewMode : DEFAULT_PREFERENCES.viewMode,
      sortKey: isSortKey(parsed.sortKey) ? parsed.sortKey : DEFAULT_PREFERENCES.sortKey,
      sortDir: isSortDir(parsed.sortDir) ? parsed.sortDir : DEFAULT_PREFERENCES.sortDir,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function persistTaskListUiPreferences(prefs: TaskListUiPreferences): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}
