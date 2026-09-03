import { describe, expect, it } from "vitest"
import {
  chordToKeycaps,
  defaultChord,
  formatKeyChord,
  getShortcutDefinition,
  KEYBOARD_SHORTCUT_DEFINITIONS,
  shortcutsMenuHint,
} from "@/lib/keyboard-shortcuts"

describe("keyboard-shortcuts", () => {
  it("renders Mac keycaps as separate chips", () => {
    const search = getShortcutDefinition("search-chats")!
    expect(chordToKeycaps(defaultChord(search, true), true)).toEqual(["⌘", "K"])
    const thinking = getShortcutDefinition("enable-thinking")!
    expect(chordToKeycaps(defaultChord(thinking, true), true)).toEqual(["⇧", "⌘", "E"])
  })

  it("renders Windows keycaps with named modifiers", () => {
    const search = getShortcutDefinition("search-chats")!
    expect(chordToKeycaps(defaultChord(search, false), false)).toEqual(["Ctrl", "K"])
    const newChat = getShortcutDefinition("new-chat")!
    expect(chordToKeycaps(defaultChord(newChat, false), false)).toEqual([
      "Ctrl",
      "Shift",
      "O",
    ])
  })

  it("formats menu hint for show-shortcuts", () => {
    expect(shortcutsMenuHint(true)).toBe("⌘ /")
    expect(shortcutsMenuHint(false)).toBe("Ctrl + /")
  })

  it("lists zoom shortcuts for the desktop shell", () => {
    const zoomIn = getShortcutDefinition("zoom-in")!
    expect(chordToKeycaps(defaultChord(zoomIn, true), true)).toEqual(["⌘", "+"])
    const zoomOut = getShortcutDefinition("zoom-out")!
    expect(chordToKeycaps(defaultChord(zoomOut, true), true)).toEqual(["⌘", "-"])
  })

  it("lists General before In chats", () => {
    const general = KEYBOARD_SHORTCUT_DEFINITIONS.filter((d) => d.category === "app")
    const chats = KEYBOARD_SHORTCUT_DEFINITIONS.filter((d) => d.category === "composer")
    expect(general.length).toBeGreaterThan(0)
    expect(chats.length).toBeGreaterThan(0)
    expect(formatKeyChord(defaultChord(general[0]!, true), true)).toContain("⌘")
  })
})
