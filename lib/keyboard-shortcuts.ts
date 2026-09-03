/** Fixed keyboard shortcuts (read-only, Claude-style reference + global handlers). */

export type ShortcutCategory = "composer" | "app"

export interface KeyChord {
  key: string
  meta?: boolean
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
}

export interface ShortcutDefinition {
  id: string
  category: ShortcutCategory
  label: string
  mac: KeyChord
  win: KeyChord
}

export const SHORTCUT_EVENT = "masternode:keyboard-shortcut"

export const KEYBOARD_SHORTCUT_CATEGORIES: { id: ShortcutCategory; label: string }[] = [
  { id: "app", label: "General" },
  { id: "composer", label: "In chats" },
]

export const KEYBOARD_SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  {
    id: "search-chats",
    category: "app",
    label: "Quick chat or search",
    mac: { meta: true, key: "k" },
    win: { ctrl: true, key: "k" },
  },
  {
    id: "incognito-chat",
    category: "app",
    label: "Incognito chat",
    mac: { meta: true, shift: true, key: "i" },
    win: { ctrl: true, shift: true, key: "i" },
  },
  {
    id: "toggle-sidebar",
    category: "app",
    label: "Toggle sidebar",
    mac: { meta: true, key: "b" },
    win: { ctrl: true, key: "b" },
  },
  {
    id: "toggle-sidebar-dot",
    category: "app",
    label: "Toggle sidebar",
    mac: { meta: true, key: "." },
    win: { ctrl: true, key: "." },
  },
  {
    id: "show-shortcuts",
    category: "app",
    label: "Keyboard shortcuts",
    mac: { meta: true, key: "/" },
    win: { ctrl: true, key: "/" },
  },
  {
    id: "open-settings",
    category: "app",
    label: "Settings",
    mac: { meta: true, shift: true, key: "," },
    win: { ctrl: true, shift: true, key: "," },
  },
  {
    id: "zoom-in",
    category: "app",
    label: "Zoom in",
    mac: { meta: true, key: "+" },
    win: { ctrl: true, key: "+" },
  },
  {
    id: "zoom-out",
    category: "app",
    label: "Zoom out",
    mac: { meta: true, key: "-" },
    win: { ctrl: true, key: "-" },
  },
  {
    id: "zoom-reset",
    category: "app",
    label: "Reset zoom",
    mac: { meta: true, key: "0" },
    win: { ctrl: true, key: "0" },
  },
  {
    id: "new-chat",
    category: "app",
    label: "Open new chat",
    mac: { meta: true, shift: true, key: "o" },
    win: { ctrl: true, shift: true, key: "o" },
  },
  {
    id: "send-message",
    category: "composer",
    label: "Send message",
    mac: { key: "enter" },
    win: { key: "enter" },
  },
  {
    id: "new-line",
    category: "composer",
    label: "New line in message",
    mac: { shift: true, key: "enter" },
    win: { shift: true, key: "enter" },
  },
  {
    id: "enable-thinking",
    category: "composer",
    label: "Toggle extended thinking",
    mac: { meta: true, shift: true, key: "e" },
    win: { ctrl: true, shift: true, key: "e" },
  },
  {
    id: "add-files",
    category: "composer",
    label: "Upload file",
    mac: { meta: true, key: "u" },
    win: { ctrl: true, key: "u" },
  },
  {
    id: "toggle-dictation",
    category: "composer",
    label: "Toggle dictation",
    mac: { ctrl: true, shift: true, key: "d" },
    win: { ctrl: true, shift: true, key: "d" },
  },
  {
    id: "stop-response",
    category: "composer",
    label: "Stop response",
    mac: { key: "escape" },
    win: { key: "escape" },
  },
]

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export function normalizeShortcutKey(key: string): string {
  const raw = key.trim()
  if (!raw) return ""
  if (raw === "Enter") return "enter"
  if (raw === "Escape") return "escape"
  if (raw === " ") return "space"
  if (raw === "/") return "/"
  if (raw === ".") return "."
  if (raw === ",") return ","
  return raw.length === 1 ? raw.toLowerCase() : raw.toLowerCase()
}

export function chordFromKeyboardEvent(e: KeyboardEvent): KeyChord | null {
  const key = normalizeShortcutKey(e.key)
  if (!key || key === "control" || key === "shift" || key === "alt" || key === "meta") {
    return null
  }
  return {
    key,
    meta: e.metaKey || undefined,
    ctrl: e.ctrlKey || undefined,
    alt: e.altKey || undefined,
    shift: e.shiftKey || undefined,
  }
}

export function defaultChord(def: ShortcutDefinition, isMac = isMacPlatform()): KeyChord {
  return isMac ? { ...def.mac } : { ...def.win }
}

export function getShortcutDefinition(id: string): ShortcutDefinition | undefined {
  return KEYBOARD_SHORTCUT_DEFINITIONS.find((def) => def.id === id)
}

export function chordsEqual(a: KeyChord, b: KeyChord): boolean {
  return (
    normalizeShortcutKey(a.key) === normalizeShortcutKey(b.key) &&
    Boolean(a.meta) === Boolean(b.meta) &&
    Boolean(a.ctrl) === Boolean(b.ctrl) &&
    Boolean(a.alt) === Boolean(b.alt) &&
    Boolean(a.shift) === Boolean(b.shift)
  )
}

export function eventMatchesChord(e: KeyboardEvent, chord: KeyChord): boolean {
  return chordsEqual(chordFromKeyboardEvent(e) ?? { key: "" }, chord)
}

const MAC_KEY_LABELS: Record<string, string> = {
  enter: "⏎",
  escape: "Esc",
  space: "Space",
  "/": "/",
  ".": ".",
  ",": ",",
  "+": "+",
  "-": "-",
  "0": "0",
}

const WIN_KEY_LABELS: Record<string, string> = {
  enter: "Enter",
  escape: "Esc",
  space: "Space",
  "/": "/",
  ".": ".",
  ",": ",",
  "+": "+",
  "-": "-",
  "0": "0",
}

export function formatKeyToken(key: string, isMac: boolean): string {
  const normalized = normalizeShortcutKey(key)
  const labels = isMac ? MAC_KEY_LABELS : WIN_KEY_LABELS
  if (labels[normalized]) return labels[normalized]
  return normalized.length === 1 ? normalized.toUpperCase() : normalized
}

/** Individual keycap labels for Claude-style shortcut display. */
export function chordToKeycaps(chord: KeyChord, isMac = isMacPlatform()): string[] {
  const caps: string[] = []
  if (isMac) {
    if (chord.ctrl) caps.push("⌃")
    if (chord.alt) caps.push("⌥")
    if (chord.shift) caps.push("⇧")
    if (chord.meta) caps.push("⌘")
    caps.push(formatKeyToken(chord.key, true))
    return caps
  }

  if (chord.ctrl) caps.push("Ctrl")
  if (chord.alt) caps.push("Alt")
  if (chord.shift) caps.push("Shift")
  if (chord.meta) caps.push("Win")
  caps.push(formatKeyToken(chord.key, false))
  return caps
}

/** Compact hint for menu rows, e.g. ⌘ / or Ctrl + / */
export function formatKeyChord(chord: KeyChord, isMac = isMacPlatform()): string {
  return chordToKeycaps(chord, isMac).join(isMac ? " " : " + ")
}

export function shortcutsMenuHint(isMac = isMacPlatform()): string {
  const def = getShortcutDefinition("show-shortcuts")
  if (!def) return isMac ? "⌘ /" : "Ctrl + /"
  return formatKeyChord(defaultChord(def, isMac), isMac)
}

export function dispatchShortcut(id: string): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SHORTCUT_EVENT, { detail: { id } }))
}

export function findMatchingShortcut(
  e: KeyboardEvent,
  isMac = isMacPlatform()
): ShortcutDefinition | null {
  for (const def of KEYBOARD_SHORTCUT_DEFINITIONS) {
    const chord = defaultChord(def, isMac)
    if (eventMatchesChord(e, chord)) return def
  }
  return null
}

/** @deprecated Use formatKeyChord */
export function formatModKey(keys: string): string {
  const isMac = isMacPlatform()
  const mod = isMac ? "⌘" : "Ctrl"
  return keys.replace(/\bMod\b/g, mod)
}

export const HELP_KEYBOARD_SHORTCUTS = KEYBOARD_SHORTCUT_DEFINITIONS.filter(
  (def) => def.id !== "toggle-sidebar-dot"
).map((def) => ({
  action: def.label,
  definition: def,
}))
