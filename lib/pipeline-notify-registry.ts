const OPT_IN_KEY = "mn_pipeline_notify_opt_ins"
const DISMISSED_KEY = "mn_pipeline_notify_dismissed"

export type PipelineNotifyOptIn = {
  taskId: string
  conversationId: string
  optedInAt: number
}

type OptInMap = Record<string, PipelineNotifyOptIn>
type DismissedSet = string[]

function readOptInMap(): OptInMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(OPT_IN_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    return parsed as OptInMap
  } catch {
    return {}
  }
}

function writeOptInMap(map: OptInMap): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(OPT_IN_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / private mode
  }
}

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === "string" && id.trim()))
  } catch {
    return new Set()
  }
}

function writeDismissed(set: Set<string>): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]))
  } catch {
    // ignore
  }
}

export function isPipelineNotifyOptedIn(taskId: string): boolean {
  const tid = taskId.trim()
  if (!tid) return false
  return Boolean(readOptInMap()[tid])
}

export function isPipelineNotifyPromptDismissed(taskId: string): boolean {
  const tid = taskId.trim()
  if (!tid) return false
  return readDismissed().has(tid)
}

export function shouldShowPipelineNotifyPrompt(taskId: string): boolean {
  const tid = taskId.trim()
  if (!tid) return false
  return !isPipelineNotifyOptedIn(tid) && !isPipelineNotifyPromptDismissed(tid)
}

export function optInPipelineNotify(taskId: string, conversationId: string): void {
  const tid = taskId.trim()
  const cid = conversationId.trim()
  if (!tid || !cid) return
  const map = readOptInMap()
  map[tid] = { taskId: tid, conversationId: cid, optedInAt: Date.now() }
  writeOptInMap(map)
  const dismissed = readDismissed()
  dismissed.add(tid)
  writeDismissed(dismissed)
}

export function dismissPipelineNotifyPrompt(taskId: string): void {
  const tid = taskId.trim()
  if (!tid) return
  const dismissed = readDismissed()
  dismissed.add(tid)
  writeDismissed(dismissed)
}

export function readPipelineNotifyOptIns(): PipelineNotifyOptIn[] {
  return Object.values(readOptInMap())
}

export function clearPipelineNotifyOptIn(taskId: string): void {
  const tid = taskId.trim()
  if (!tid) return
  const map = readOptInMap()
  delete map[tid]
  writeOptInMap(map)
}
