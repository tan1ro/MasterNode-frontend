import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { scrubClientPrivacyResidue } from "./client-privacy"

function installMemoryLocalStorage(initial: Record<string, string> = {}) {
  let store: Record<string, string> = { ...initial }
  let session: Record<string, string> = {}
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
  vi.stubGlobal(
    "sessionStorage",
    {
      getItem: (k: string) => (k in session ? session[k] : null),
      setItem: (k: string, v: string) => {
        session[k] = String(v)
      },
      removeItem: (k: string) => {
        delete session[k]
      },
      clear: () => {
        session = {}
      },
      key: (i: number) => Object.keys(session)[i] ?? null,
      get length() {
        return Object.keys(session).length
      },
    } as Storage
  )
  return {
    get local() {
      return store
    },
    get session() {
      return session
    },
  }
}

describe("scrubClientPrivacyResidue", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("moves api_key out of localStorage and drops mn_auth_users", () => {
    const mem = installMemoryLocalStorage({
      api_key: "secret",
      mn_auth_users: JSON.stringify([{ id: "a", email: "a@x.com", password: "p" }]),
      mn_auth_session_user_id: "usr_active",
      "mn_onboarding_v1:usr_other": JSON.stringify({ role: "student", completed_at: "x" }),
      "mn_onboarding_v1:usr_active": JSON.stringify({ completed_at: "y" }),
    })
    scrubClientPrivacyResidue("usr_active")
    expect(mem.local.api_key).toBeUndefined()
    expect(mem.session.api_key).toBe("secret")
    expect(mem.local.mn_auth_users).toBeUndefined()
    expect(mem.local["mn_onboarding_v1:usr_other"]).toBeUndefined()
    expect(mem.local["mn_onboarding_v1:usr_active"]).toBeTruthy()
  })
})
