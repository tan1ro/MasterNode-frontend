import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  CHAT_ENABLED_MEMORY_KEY,
  clearChatEnabledMemory,
  disableMemoryFile,
  enableAllMemoryFiles,
  enableMemoryFile,
  isMemoryFileEnabled,
  loadChatEnabledMemoryKeys,
  pruneChatEnabledMemoryKeys,
  resolveChatEnabledMemoryFiles,
} from "@/lib/chat-enabled-memory"

function installMemoryLocalStorage() {
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
  installMemoryLocalStorage()
})

afterEach(() => {
  localStorage.removeItem(CHAT_ENABLED_MEMORY_KEY)
  vi.unstubAllGlobals()
})

describe("chat-enabled-memory", () => {
  it("enables and disables memory files", () => {
    enableMemoryFile("Agent Land vs MasterNode.pdf")
    enableMemoryFile("PIE_writeup.html")

    expect(loadChatEnabledMemoryKeys()).toEqual([
      "Agent Land vs MasterNode.pdf",
      "PIE_writeup.html",
    ])
    expect(isMemoryFileEnabled("Agent Land vs MasterNode.pdf")).toBe(true)

    disableMemoryFile("Agent Land vs MasterNode.pdf")
    expect(loadChatEnabledMemoryKeys()).toEqual(["PIE_writeup.html"])
  })

  it("replaces enabled keys when enabling all", () => {
    enableMemoryFile("old-file.pdf")
    enableAllMemoryFiles(["a.pdf", "b.pdf"])
    expect(loadChatEnabledMemoryKeys()).toEqual(["a.pdf", "b.pdf"])
  })

  it("prunes stale enabled keys", () => {
    enableAllMemoryFiles(["keep.pdf", "drop.pdf"])
    pruneChatEnabledMemoryKeys(["keep.pdf"])
    expect(loadChatEnabledMemoryKeys()).toEqual(["keep.pdf"])
  })

  it("resolves enabled files in stable order", () => {
    const files = [
      { file_id: "2", filename: "b.pdf" },
      { file_id: "1", filename: "a.pdf" },
    ]
    const resolved = resolveChatEnabledMemoryFiles(["a.pdf", "missing.pdf", "b.pdf"], files)
    expect(resolved.map((f) => f.filename)).toEqual(["a.pdf", "b.pdf"])
  })

  it("clears enabled memory", () => {
    enableMemoryFile("a.pdf")
    clearChatEnabledMemory()
    expect(loadChatEnabledMemoryKeys()).toEqual([])
  })
})
