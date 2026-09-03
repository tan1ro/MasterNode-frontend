import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import {
  CHAT_ENABLED_MEMORY_CHANGED,
  clearChatEnabledMemory,
  loadChatEnabledMemoryKeys,
} from "@/lib/chat-enabled-memory"
import { loadStoredRunContext, persistStoredRunContext } from "@/lib/pipeline-run-context"
import { loadSettingsPreferences, persistSettingsPreferences } from "@/lib/settings-preferences"

export { CHAT_ENABLED_MEMORY_CHANGED }

export function setGlobalMemoryEnabled(enabled: boolean): void {
  const prefs = loadSettingsPreferences()
  if (prefs.memoryEnabled === enabled) return
  persistSettingsPreferences({ ...prefs, memoryEnabled: enabled })
}

/** Turn off chat memory and disable all Memory-page file toggles. */
export function disableMemoryFromChat(): void {
  clearChatEnabledMemory()
  setGlobalMemoryEnabled(false)
}

export function enableMemoryFromChat(): void {
  setGlobalMemoryEnabled(true)
}

export function hasChatEnabledMemoryFiles(): boolean {
  return loadChatEnabledMemoryKeys().length > 0
}

export function resolveInitialChatUseMemory(ragFileCount: number): boolean {
  if (hasChatEnabledMemoryFiles()) return true
  return loadStoredRunContext(ragFileCount).useMemory
}

export function persistChatMemoryContext(ctx: ChatContextSelection): void {
  persistStoredRunContext({
    useMemory: ctx.useMemory,
    memorySources: ctx.memorySources,
    templateIds: ctx.templateIds,
  })
}

/** Sync chat context when Memory-page enabled file list changes. */
export function chatContextAfterEnabledFilesChanged(
  prev: ChatContextSelection
): ChatContextSelection {
  if (!hasChatEnabledMemoryFiles()) {
    setGlobalMemoryEnabled(false)
    return { ...prev, useMemory: false, memorySources: [] }
  }
  setGlobalMemoryEnabled(true)
  return { ...prev, useMemory: true }
}

/** Apply when the user turns memory off from chat UI. */
export function chatContextAfterMemoryDisabled(
  prev: ChatContextSelection
): ChatContextSelection {
  disableMemoryFromChat()
  return { ...prev, useMemory: false, memorySources: [] }
}
