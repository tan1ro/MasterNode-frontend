import { describe, expect, it, vi, beforeEach } from "vitest"

function guestJwt(expOffsetSec: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      sub: "anon:abc",
      typ: "guest",
      exp: Math.floor(Date.now() / 1000) + expOffsetSec,
    })
  )
  return `${header}.${payload}.sig`
}

describe("ensureGuestToken", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null
      },
      setItem(key: string, value: string) {
        this.store[key] = value
      },
      removeItem(key: string) {
        delete this.store[key]
      },
    })
  })

  it("refreshes expired guest tokens", async () => {
    const expired = guestJwt(-120)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: guestJwt(3600) }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { setGuestToken } = await import("@/lib/session-token-store")
    const { ensureGuestToken } = await import("@/lib/session-token")
    setGuestToken(expired)
    const token = await ensureGuestToken()
    expect(fetchMock).toHaveBeenCalled()
    expect(token).not.toBe(expired)
    expect(localStorage.getItem("mn_guest_token")).toBeNull()
  })

  it("reuses valid in-memory guest tokens", async () => {
    const valid = guestJwt(3600)
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const { setGuestToken } = await import("@/lib/session-token-store")
    const { ensureGuestToken } = await import("@/lib/session-token")
    setGuestToken(valid)
    const token = await ensureGuestToken()
    expect(token).toBe(valid)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(localStorage.getItem("mn_guest_token")).toBeNull()
  })

  it("does not restore guest tokens from localStorage", async () => {
    const persisted = guestJwt(3600)
    localStorage.setItem("mn_guest_token", persisted)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: guestJwt(7200) }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { ensureGuestToken } = await import("@/lib/session-token")
    const token = await ensureGuestToken()
    expect(fetchMock).toHaveBeenCalled()
    expect(token).not.toBe(persisted)
  })
})
