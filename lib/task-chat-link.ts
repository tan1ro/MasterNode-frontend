import { ROUTES } from "@/lib/routes"
import type { Task } from "@/types/api"

const STORAGE_KEY = "mn_task_conversation_links"

type LinkMap = Record<string, string>

function readLinkMap(): LinkMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    return parsed as LinkMap
  } catch {
    return {}
  }
}

function writeLinkMap(map: LinkMap): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / private mode
  }
}

/** Remember which chat thread launched a pipeline task (same browser session). */
export function rememberTaskConversationLink(taskId: string, conversationId: string): void {
  const tid = taskId.trim()
  const cid = conversationId.trim()
  if (!tid || !cid) return
  const map = readLinkMap()
  map[tid] = cid
  writeLinkMap(map)
}

export function readStoredTaskConversationId(taskId: string): string | null {
  const tid = taskId.trim()
  if (!tid) return null
  const stored = readLinkMap()[tid]
  return stored && stored.trim() ? stored.trim() : null
}

export function parseTaskChatQueryParam(search: string): string | null {
  if (!search) return null
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const chat = (params.get("chat") || params.get("conversation_id") || "").trim()
  return chat || null
}

export function taskDetailHref(taskId: string, conversationId?: string | null): string {
  const base = ROUTES.taskDetail(taskId)
  const cid = (conversationId || "").trim()
  if (!cid) return base
  return `${base}?chat=${encodeURIComponent(cid)}`
}

export function resolveTaskConversationId(
  task: Pick<Task, "source_conversation_id"> | undefined,
  taskId: string,
  queryChatId?: string | null
): string | null {
  const fromTask = (task?.source_conversation_id || "").trim()
  if (fromTask) return fromTask
  const fromQuery = (queryChatId || "").trim()
  if (fromQuery) return fromQuery
  return readStoredTaskConversationId(taskId)
}
