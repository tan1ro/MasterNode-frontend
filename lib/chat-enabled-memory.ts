"use client"

import { ragFileSourceKey } from "@/lib/rag-file-utils"
import type { RagFile } from "@/types/api"

export const CHAT_ENABLED_MEMORY_KEY = "pref_chat_enabled_memory_files"
export const CHAT_ENABLED_MEMORY_CHANGED = "masternode-chat-enabled-memory-changed"

export function loadChatEnabledMemoryKeys(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CHAT_ENABLED_MEMORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    const out: string[] = []
    for (const value of parsed) {
      const key = String(value || "").trim()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(key)
    }
    return out
  } catch {
    return []
  }
}

export function persistChatEnabledMemoryKeys(keys: string[]): void {
  if (typeof window === "undefined") return
  const cleaned = keys.map((key) => String(key).trim()).filter(Boolean)
  localStorage.setItem(CHAT_ENABLED_MEMORY_KEY, JSON.stringify(cleaned))
  window.dispatchEvent(new Event(CHAT_ENABLED_MEMORY_CHANGED))
}

export function isMemoryFileEnabled(
  sourceKey: string,
  enabledKeys: string[] = loadChatEnabledMemoryKeys()
): boolean {
  const key = sourceKey.trim()
  if (!key) return false
  return enabledKeys.includes(key)
}

export function enableMemoryFile(sourceKey: string): string[] {
  const key = sourceKey.trim()
  if (!key) return loadChatEnabledMemoryKeys()
  const current = loadChatEnabledMemoryKeys()
  if (current.includes(key)) return current
  const next = [...current, key]
  persistChatEnabledMemoryKeys(next)
  return next
}

export function disableMemoryFile(sourceKey: string): string[] {
  const key = sourceKey.trim()
  const current = loadChatEnabledMemoryKeys()
  if (!key) return current
  const next = current.filter((value) => value !== key)
  persistChatEnabledMemoryKeys(next)
  return next
}

export function setMemoryFileEnabled(sourceKey: string, enabled: boolean): string[] {
  return enabled ? enableMemoryFile(sourceKey) : disableMemoryFile(sourceKey)
}

export function enableAllMemoryFiles(sourceKeys: string[]): string[] {
  const seen = new Set<string>()
  const next: string[] = []
  for (const raw of sourceKeys) {
    const key = String(raw || "").trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    next.push(key)
  }
  persistChatEnabledMemoryKeys(next)
  return next
}

export function clearChatEnabledMemory(): string[] {
  persistChatEnabledMemoryKeys([])
  return []
}

export function pruneChatEnabledMemoryKeys(validSourceKeys: string[]): string[] {
  const valid = new Set(validSourceKeys.map((key) => String(key).trim()).filter(Boolean))
  const current = loadChatEnabledMemoryKeys()
  const next = current.filter((key) => valid.has(key))
  if (next.length === current.length) return current
  persistChatEnabledMemoryKeys(next)
  return next
}

export function resolveChatEnabledMemoryFiles(
  enabledKeys: string[],
  files: RagFile[] | undefined
): RagFile[] {
  if (!enabledKeys.length) return []
  const byKey = new Map<string, RagFile>()
  for (const file of files ?? []) {
    const key = ragFileSourceKey(file)
    if (key) byKey.set(key, file)
  }
  const out: RagFile[] = []
  for (const key of enabledKeys) {
    const match = byKey.get(key)
    if (match) out.push(match)
  }
  return out
}
