import { loadSettingsPreferences } from "@/lib/settings-preferences"

export function resolveWorkspaceDisplayName(input: {
  prefsDisplayName?: string
  username?: string | null
  email?: string | null
}): string {
  const fromPrefs = input.prefsDisplayName?.trim()
  if (fromPrefs) return fromPrefs
  const username = input.username?.trim()
  if (username) return username
  const email = input.email?.trim()
  if (email) {
    const local = email.split("@")[0]?.trim()
    if (local) return local
  }
  return "Account"
}

export function workspaceDisplayNameFromStorage(user?: {
  username?: string | null
  email?: string | null
} | null): string {
  const prefs = loadSettingsPreferences()
  return resolveWorkspaceDisplayName({
    prefsDisplayName: prefs.displayName,
    username: user?.username,
    email: user?.email,
  })
}
