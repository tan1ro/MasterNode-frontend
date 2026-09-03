"use client"

import { useEffect } from "react"
import {
  dispatchShortcut,
  findMatchingShortcut,
  type ShortcutDefinition,
} from "@/lib/keyboard-shortcuts"

const COMPOSER_INPUT_SELECTOR = "[data-chat-composer-input]"

function isComposerFocused(): boolean {
  const active = document.activeElement
  return active instanceof HTMLElement && Boolean(active.closest(COMPOSER_INPUT_SELECTOR))
}

function shouldHandleShortcut(def: ShortcutDefinition): boolean {
  if (def.category === "composer") {
    return isComposerFocused() || def.id === "add-files" || def.id === "toggle-dictation"
  }
  if (def.id === "stop-response") return false
  return true
}

export function useKeyboardShortcutsHandler(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return
      if (e.repeat) return

      const match = findMatchingShortcut(e)
      if (!match) return
      if (!shouldHandleShortcut(match)) return
      if (match.id === "send-message" || match.id === "new-line") return
      if (match.id === "zoom-in" || match.id === "zoom-out" || match.id === "zoom-reset") return

      e.preventDefault()
      dispatchShortcut(match.id)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [enabled])
}
