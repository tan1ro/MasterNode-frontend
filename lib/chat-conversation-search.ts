import { getUserTimeZone, parseApiTimestamp } from "@/lib/datetime-local"
import type { ChatConversation } from "@/types/api"

export type ChatConversationSortKey = "newest" | "oldest" | "title_asc" | "title_desc"

export type ChatConversationDateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "custom"

export const CHAT_SORT_OPTIONS: { value: ChatConversationSortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
]

export const CHAT_DATE_FILTER_OPTIONS: { value: ChatConversationDateFilter; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
]

function calendarDayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

export function conversationActivityDate(conversation: ChatConversation): Date | null {
  return (
    parseApiTimestamp(conversation.updated_at) ??
    parseApiTimestamp(conversation.created_at)
  )
}

function parseLocalDateStart(isoDate: string): Date | null {
  const raw = isoDate.trim()
  if (!raw) return null
  const d = new Date(`${raw}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseLocalDateEnd(isoDate: string): Date | null {
  const raw = isoDate.trim()
  if (!raw) return null
  const d = new Date(`${raw}T23:59:59.999`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function matchesConversationDateFilter(
  conversation: ChatConversation,
  filter: ChatConversationDateFilter,
  customFrom?: string,
  customTo?: string
): boolean {
  if (filter === "all") return true

  const activity = conversationActivityDate(conversation)
  if (!activity) return false

  const tz = getUserTimeZone()
  const now = new Date()

  if (filter === "today") {
    return calendarDayKey(activity, tz) === calendarDayKey(now, tz)
  }

  if (filter === "yesterday") {
    const yesterday = new Date(now.getTime() - 86_400_000)
    return calendarDayKey(activity, tz) === calendarDayKey(yesterday, tz)
  }

  if (filter === "last_7_days") {
    const start = new Date(now.getTime() - 7 * 86_400_000)
    return activity >= start && activity <= now
  }

  if (filter === "last_30_days") {
    const start = new Date(now.getTime() - 30 * 86_400_000)
    return activity >= start && activity <= now
  }

  if (filter === "custom") {
    const fromRaw = customFrom?.trim() ?? ""
    const toRaw = customTo?.trim() ?? ""
    if (!fromRaw && !toRaw) return true
    const from = parseLocalDateStart(fromRaw)
    const to = parseLocalDateEnd(toRaw)
    if (from && activity < from) return false
    if (to && activity > to) return false
    return true
  }

  return true
}

export function sortConversations(
  items: ChatConversation[],
  sortKey: ChatConversationSortKey
): ChatConversation[] {
  const copy = [...items]
  copy.sort((a, b) => {
    if (sortKey === "title_asc" || sortKey === "title_desc") {
      const ta = (a.title || "New chat").toLowerCase()
      const tb = (b.title || "New chat").toLowerCase()
      const cmp = ta.localeCompare(tb)
      return sortKey === "title_asc" ? cmp : -cmp
    }
    const da = conversationActivityDate(a)?.getTime() ?? 0
    const db = conversationActivityDate(b)?.getTime() ?? 0
    return sortKey === "newest" ? db - da : da - db
  })
  return copy
}

export function filterAndSortConversations(
  conversations: ChatConversation[],
  options: {
    query?: string
    sortKey: ChatConversationSortKey
    dateFilter: ChatConversationDateFilter
    customFrom?: string
    customTo?: string
  }
): ChatConversation[] {
  const q = options.query?.trim().toLowerCase() ?? ""
  let out = conversations

  if (q) {
    out = out.filter((c) => {
      const title = (c.title || "New chat").toLowerCase()
      const preview = (c.last_message_preview || "").toLowerCase()
      return title.includes(q) || preview.includes(q)
    })
  }

  out = out.filter((c) =>
    matchesConversationDateFilter(c, options.dateFilter, options.customFrom, options.customTo)
  )

  return sortConversations(out, options.sortKey)
}
