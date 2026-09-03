import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  attachTemplateToChat,
  CHAT_ATTACHED_ASSISTANTS_KEY,
  detachTemplateFromChat,
  isTemplateAttachedToChat,
  listAttachedTemplateIds,
  listUserCustomAgentTemplates,
  loadChatAttachedTemplates,
  resolveChatEnabledTemplates,
  resolveCustomizeAssistants,
} from "@/lib/chat-attached-assistants"

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
  localStorage.removeItem(CHAT_ATTACHED_ASSISTANTS_KEY)
  vi.unstubAllGlobals()
})

describe("chat-attached-assistants", () => {
  it("attaches templates to chat", () => {
    attachTemplateToChat("sample-custom-research")
    attachTemplateToChat("sample-custom-summarizer")

    const stored = loadChatAttachedTemplates()
    expect(stored.custom).toEqual(["sample-custom-research", "sample-custom-summarizer"])
    expect(isTemplateAttachedToChat("sample-custom-research", stored)).toBe(true)
    expect(isTemplateAttachedToChat("sample-custom-summarizer", stored)).toBe(true)
  })

  it("allows multiple templates attached at once", () => {
    attachTemplateToChat("sample-custom-research")
    attachTemplateToChat("sample-custom-writer")

    const stored = loadChatAttachedTemplates()
    expect(stored.custom).toEqual(["sample-custom-research", "sample-custom-writer"])
  })

  it("detaches a single template without affecting others", () => {
    attachTemplateToChat("sample-custom-research")
    attachTemplateToChat("sample-custom-summarizer")

    detachTemplateFromChat("sample-custom-research")

    const stored = loadChatAttachedTemplates()
    expect(stored.custom).toEqual(["sample-custom-summarizer"])
    expect(isTemplateAttachedToChat("sample-custom-research", stored)).toBe(false)
    expect(isTemplateAttachedToChat("sample-custom-summarizer", stored)).toBe(true)
  })

  it("lists attached template ids in stable order", () => {
    attachTemplateToChat("sample-custom-research")
    attachTemplateToChat("sample-custom-summarizer")

    expect(listAttachedTemplateIds()).toEqual([
      "sample-custom-research",
      "sample-custom-summarizer",
    ])
    expect(loadChatAttachedTemplates().custom).toEqual([
      "sample-custom-research",
      "sample-custom-summarizer",
    ])
  })

  it("resolves enabled templates from API and built-in samples", () => {
    const apiTemplates = [
      {
        template_id: "my-custom",
        name: "My custom",
        description: "",
        prompt_template: "",
        variables: [],
      },
    ]
    const resolved = resolveChatEnabledTemplates(
      ["my-custom", "sample-custom-research", "pending-id"],
      apiTemplates
    )
    expect(resolved.map((t) => t.template_id)).toEqual([
      "my-custom",
      "sample-custom-research",
      "pending-id",
    ])
    expect(resolved[0]?.name).toBe("My custom")
    expect(resolved[1]?.name).toContain("Research")
  })

  it("lists custom API templates on customize even when not attached", () => {
    const apiTemplates = [
      {
        template_id: "custom-research-bot",
        name: "Research bot",
        description: "",
        prompt_template: "",
        variables: [],
      },
      {
        template_id: "sample-custom-research",
        name: "Gallery research",
        description: "",
        prompt_template: "",
        variables: [],
      },
    ]
    const rows = resolveCustomizeAssistants(["sample-custom-research"], apiTemplates)
    expect(rows.map((r) => [r.template.template_id, r.attached])).toEqual([
      ["sample-custom-research", true],
      ["custom-research-bot", false],
    ])
  })

  it("lists user custom agents for the Custom gallery category", () => {
    const apiTemplates = [
      {
        template_id: "custom-my-bot",
        name: "My bot",
        description: "Summary",
        prompt_template: "You are helpful",
        variables: [],
      },
      {
        template_id: "sample-marketing-ad-copy",
        name: "Ad copy",
        description: "",
        prompt_template: "",
        variables: [],
      },
    ]
    expect(listUserCustomAgentTemplates(apiTemplates).map((t) => t.template_id)).toEqual([
      "custom-my-bot",
    ])
  })
})
