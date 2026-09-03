import { beforeAll } from "vitest"

/** Node 22+ / broken jsdom localStorage shims — keep tests deterministic. */
beforeAll(() => {
  if (typeof localStorage === "undefined" || typeof localStorage.getItem !== "function") {
    const store = new Map<string, string>()
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value)
        },
        removeItem: (key: string) => {
          store.delete(key)
        },
        clear: () => {
          store.clear()
        },
      },
      configurable: true,
    })
  }
})
