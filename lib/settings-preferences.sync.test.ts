import { describe, expect, it } from "vitest"
import {
  DEFAULT_SETTINGS_PREFERENCES,
  mergeServerPreferences,
  preferencesForServerSync,
} from "@/lib/settings-preferences"

describe("settings preferences sync helpers", () => {
  it("merges server prefs without clobbering avatarDataUrl", () => {
    const local = {
      ...DEFAULT_SETTINGS_PREFERENCES,
      customInstructions: "local",
      avatarDataUrl: "data:local",
    }
    const merged = mergeServerPreferences(local, {
      customInstructions: "server",
      avatarDataUrl: "data:server-should-ignore",
      themePreference: "dark",
    })
    expect(merged.customInstructions).toBe("server")
    expect(merged.themePreference).toBe("dark")
    expect(merged.avatarDataUrl).toBe("data:local")
  })

  it("omits avatar from server sync payload", () => {
    const payload = preferencesForServerSync({
      ...DEFAULT_SETTINGS_PREFERENCES,
      avatarDataUrl: "data:big",
      displayName: "Ada",
    })
    expect(payload.displayName).toBe("Ada")
    expect(payload).not.toHaveProperty("avatarDataUrl")
  })
})
