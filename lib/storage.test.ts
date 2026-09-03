import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearAppUserIdForBackendSync,
  getOrCreateUserId,
  getStoredApiKey,
  getStoredUserId,
  isApiKeyActive,
  removeStoredApiKey,
  setAppUserIdForBackendSync,
  setStoredApiKey,
} from "./storage"

function installMemoryStorage() {
  let local: Record<string, string> = {}
  let session: Record<string, string> = {}
  const make = (store: () => Record<string, string>): Storage =>
    ({
      getItem: (k: string) => {
        const s = store()
        return k in s ? s[k] : null
      },
      setItem: (k: string, v: string) => {
        store()[k] = String(v)
      },
      removeItem: (k: string) => {
        delete store()[k]
      },
      clear: () => {
        const s = store()
        for (const key of Object.keys(s)) delete s[key]
      },
      key: (i: number) => Object.keys(store())[i] ?? null,
      get length() {
        return Object.keys(store()).length
      },
    }) as Storage
  vi.stubGlobal("localStorage", make(() => local))
  vi.stubGlobal("sessionStorage", make(() => session))
}

describe("storage", () => {
  beforeEach(() => {
    installMemoryStorage()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("round-trips API key in sessionStorage (not localStorage)", () => {
    expect(getStoredApiKey()).toBeNull()
    setStoredApiKey("secret-key")
    expect(getStoredApiKey()).toBe("secret-key")
    expect(sessionStorage.getItem("api_key")).toBe("secret-key")
    expect(localStorage.getItem("api_key")).toBeNull()
    removeStoredApiKey()
    expect(getStoredApiKey()).toBeNull()
  })

  it("migrates legacy localStorage api_key into sessionStorage", () => {
    localStorage.setItem("api_key", "legacy-secret")
    expect(getStoredApiKey()).toBe("legacy-secret")
    expect(localStorage.getItem("api_key")).toBeNull()
    expect(sessionStorage.getItem("api_key")).toBe("legacy-secret")
  })

  it("setAppUserIdForBackendSync ignores empty and trims", () => {
    setAppUserIdForBackendSync("   ")
    expect(localStorage.getItem("app_user_id")).toBeNull()
    setAppUserIdForBackendSync("  user_123  ")
    expect(getStoredUserId()).toBe("user_123")
    clearAppUserIdForBackendSync()
    expect(localStorage.getItem("app_user_id")).toBeNull()
  })

  it("setAppUserIdForBackendSync truncates to 100 chars", () => {
    const long = "x".repeat(120)
    setAppUserIdForBackendSync(long)
    expect(getStoredUserId()?.length).toBe(100)
  })

  it("getOrCreateUserId returns anonymous outside browser", async () => {
    vi.stubGlobal("window", undefined as unknown as Window & typeof globalThis)
    vi.resetModules()
    const mod = await import("./storage")
    expect(mod.getOrCreateUserId()).toBe("anonymous")
  })

  it("getOrCreateUserId creates stable id when missing", () => {
    const id = getOrCreateUserId()
    expect(id.startsWith("user_")).toBe(true)
    expect(getOrCreateUserId()).toBe(id)
  })

  it("isApiKeyActive matches full key or prefix-10", () => {
    expect(isApiKeyActive(null, "abc")).toBe(false)
    expect(isApiKeyActive("full-key-value", "full-key-value")).toBe(true)
    expect(isApiKeyActive("prefix1234567890rest", "prefix1234567890")).toBe(true)
    expect(isApiKeyActive("other", "prefix1234567890")).toBe(false)
  })
})
