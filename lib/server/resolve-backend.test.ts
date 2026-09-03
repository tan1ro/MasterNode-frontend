import { afterEach, describe, expect, it, vi } from "vitest"

describe("resolveLiveBackendOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("skips a non-MasterNode health payload and uses the next origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000, https://masternode.onrender.com")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.startsWith("http://localhost:8000") || url.startsWith("http://127.0.0.1:8000")) {
          return new Response(JSON.stringify({ status: "ok" }), {
            headers: { "content-type": "application/json" },
          })
        }
        return new Response(JSON.stringify({ service: "masternode-rag", status: "ok" }), {
          headers: { "content-type": "application/json" },
        })
      })
    )
    const { invalidateLiveBackendOrigin, resolveLiveBackendOrigin } = await import(
      "./resolve-backend"
    )
    invalidateLiveBackendOrigin()
    await expect(resolveLiveBackendOrigin()).resolves.toBe("https://masternode.onrender.com")
  })

  it("falls back to the first configured origin when every probe fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000, https://masternode.onrender.com")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("timeout")
      })
    )
    const { invalidateLiveBackendOrigin, resolveLiveBackendOrigin } = await import(
      "./resolve-backend"
    )
    invalidateLiveBackendOrigin()
    await expect(resolveLiveBackendOrigin()).resolves.toBe("http://localhost:8000")
  })
})
