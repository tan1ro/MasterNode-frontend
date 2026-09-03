import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { chatContextToTaskOptions } from "@/components/chat/chat-context-panel"
import {
  CHAT_ENABLED_MEMORY_KEY,
  enableMemoryFile,
} from "@/lib/chat-enabled-memory"
import {
  CHAT_ENABLED_MEMORY_CHANGED,
  chatContextAfterEnabledFilesChanged,
  chatContextAfterMemoryDisabled,
  disableMemoryFromChat,
  resolveInitialChatUseMemory,
} from "@/lib/chat-memory-sync"
import { RUN_CONTEXT_STORAGE_KEY } from "@/lib/pipeline-run-context"
import { SETTINGS_PREF_KEYS } from "@/lib/settings-preferences"
import { withChatStreamPreferences } from "@/lib/chat-stream-preferences"

function installLocalStorage() {
  let store: Record<string, string> = {}
  vi.stubGlobal(
    "localStorage",
    {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = String(v)
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        store = {}
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() {
        return Object.keys(store).length
      },
    } as Storage
  )
}

beforeEach(() => {
  installLocalStorage()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("chatContextToTaskOptions", () => {
  it("sets use_rag when memory is on even without scoped sources", () => {
    const opts = chatContextToTaskOptions({
      useMemory: true,
      memorySources: [],
      templateIds: {},
    })
    expect(opts.use_rag).toBe(true)
    expect(opts.rag_sources).toBeUndefined()
  })

  it("scopes rag_sources to enabled memory files", () => {
    enableMemoryFile("notes.pdf")
    enableMemoryFile("guide.md")
    const opts = chatContextToTaskOptions({
      useMemory: true,
      memorySources: ["notes.pdf"],
      templateIds: {},
    })
    expect(opts.use_rag).toBe(true)
    expect(opts.rag_sources).toEqual(["notes.pdf"])
  })
})

describe("withChatStreamPreferences", () => {
  it("keeps use_rag when chat memory is explicitly enabled", () => {
    localStorage.setItem(SETTINGS_PREF_KEYS.memoryEnabled, "0")
    const out = withChatStreamPreferences({ message: "hi", use_rag: true }, { useMemory: true })
    expect(out.use_rag).toBe(true)
  })

  it("blocks use_rag when global memory is off and chat memory is not on", () => {
    localStorage.setItem(SETTINGS_PREF_KEYS.memoryEnabled, "0")
    const out = withChatStreamPreferences({ message: "hi", use_rag: true })
    expect(out.use_rag).toBe(false)
  })

  it("respects keywordMemoryEnabled preference", () => {
    localStorage.setItem(SETTINGS_PREF_KEYS.keywordMemoryEnabled, "0")
    const out = withChatStreamPreferences({ message: "hi" })
    expect(out.use_keyword_memory).toBe(false)
  })

  it("enables keyword memory when preference is on", () => {
    localStorage.setItem(SETTINGS_PREF_KEYS.keywordMemoryEnabled, "1")
    const out = withChatStreamPreferences({ message: "hi" })
    expect(out.use_keyword_memory).toBe(true)
  })
})

describe("chat-memory-sync", () => {
  it("auto-enables chat memory when files are enabled in Memory", () => {
    localStorage.setItem(SETTINGS_PREF_KEYS.memoryEnabled, "0")
    enableMemoryFile("report.pdf")
    const next = chatContextAfterEnabledFilesChanged({
      useMemory: false,
      memorySources: [],
      templateIds: {},
    })
    expect(next.useMemory).toBe(true)
    expect(localStorage.getItem(SETTINGS_PREF_KEYS.memoryEnabled)).toBe("1")
  })

  it("disables chat memory and Memory toggles together", () => {
    enableMemoryFile("report.pdf")
    localStorage.setItem(SETTINGS_PREF_KEYS.memoryEnabled, "1")
    const next = chatContextAfterMemoryDisabled({
      useMemory: true,
      memorySources: ["report.pdf"],
      templateIds: {},
    })
    expect(next.useMemory).toBe(false)
    expect(next.memorySources).toEqual([])
    expect(localStorage.getItem(CHAT_ENABLED_MEMORY_KEY)).toBe("[]")
    expect(localStorage.getItem(SETTINGS_PREF_KEYS.memoryEnabled)).toBe("0")
  })

  it("resolveInitialChatUseMemory prefers enabled files", () => {
    enableMemoryFile("report.pdf")
    localStorage.setItem(
      RUN_CONTEXT_STORAGE_KEY,
      JSON.stringify({ useMemory: false, memorySources: [], templateIds: {} })
    )
    expect(resolveInitialChatUseMemory(1)).toBe(true)
  })

  it("exports the enabled-memory change event name", () => {
    expect(CHAT_ENABLED_MEMORY_CHANGED).toBe("masternode-chat-enabled-memory-changed")
  })

  it("disableMemoryFromChat clears enabled files", () => {
    enableMemoryFile("a.pdf")
    disableMemoryFromChat()
    expect(localStorage.getItem(CHAT_ENABLED_MEMORY_KEY)).toBe("[]")
  })
})
