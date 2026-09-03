"use client"

import { useEffect } from "react"
import { shouldBlockInspect } from "@/lib/disable-inspect"

export { shouldBlockInspect }

/** Standard editing shortcuts — never intercept these. */
const EDITING_KEYS = new Set(["a", "c", "v", "x", "z", "y"])
const EDITING_CODES = new Set([
  "KeyA",
  "KeyC",
  "KeyV",
  "KeyX",
  "KeyZ",
  "KeyY",
])

function isEditingShortcut(event: KeyboardEvent): boolean {
  const mod = event.ctrlKey || event.metaKey
  if (!mod) return false
  // Allow Shift for redo variants (Ctrl+Shift+Z) and ignore Alt alone.
  if (event.altKey) return false
  const key = event.key.toLowerCase()
  return EDITING_KEYS.has(key) || EDITING_CODES.has(event.code)
}

/**
 * Only real DevTools / view-source / save-page chords — never plain copy/paste.
 * - F12
 * - Ctrl/Cmd+Shift+I|J|C|K (inspect / console)
 * - Ctrl/Cmd+U (view source)
 * - Ctrl/Cmd+S (save page)
 */
function isInspectShortcut(event: KeyboardEvent): boolean {
  if (event.code === "F12" || event.key === "F12") return true

  const mod = event.ctrlKey || event.metaKey
  if (!mod) return false

  // Never steal select-all / cut / copy / paste / undo / redo.
  if (isEditingShortcut(event)) return false

  const key = event.key.toLowerCase()
  const code = event.code

  // View source
  if ((key === "u" || code === "KeyU") && !event.shiftKey && !event.altKey) return true

  // Save page
  if ((key === "s" || code === "KeyS") && !event.altKey) return true

  // DevTools: Ctrl/Cmd+Shift+I|J|C|K
  if (event.shiftKey && !event.altKey) {
    if (
      key === "i" ||
      key === "j" ||
      key === "c" ||
      key === "k" ||
      code === "KeyI" ||
      code === "KeyJ" ||
      code === "KeyC" ||
      code === "KeyK"
    ) {
      return true
    }
  }

  return false
}

/** Inputs, textareas, and contenteditable need native editing shortcuts. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']"))
}

function hasTextSelection(): boolean {
  const selection = window.getSelection?.()
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim())
}

function blockInspectShortcut(event: KeyboardEvent) {
  // Always allow editing inside form fields / chat composer.
  if (isEditableTarget(event.target)) return
  if (isEditingShortcut(event)) return
  if (!isInspectShortcut(event)) return
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

function onKeyEvent(event: Event) {
  if (!(event instanceof KeyboardEvent)) return
  // Only intercept keydown — keyup must stay free for editors/clipboard.
  if (event.type !== "keydown") return
  blockInspectShortcut(event)
}

/** Touch / coarse-pointer devices — keyboard chrome is not DevTools. */
function isTouchOrMobileUi(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false
  if (navigator.maxTouchPoints > 0) return true
  try {
    if (window.matchMedia("(pointer: coarse)").matches) return true
    if (window.matchMedia("(hover: none)").matches) return true
  } catch {
    /* ignore */
  }
  return false
}

function blockContextMenu(event: Event) {
  // Long-press is paste / select on mobile — do not block it.
  if (isTouchOrMobileUi()) return
  // Right-click copy/paste must keep working in chat and forms.
  if (isEditableTarget(event.target) || hasTextSelection()) return
  event.preventDefault()
  event.stopPropagation()
}

/**
 * Discourages casual inspect / view-source on desktop.
 * Editing shortcuts (Ctrl/Cmd+A/C/V/X/Z) are never blocked.
 * No viewport-size overlay — outer/inner width gaps false-positive on
 * window resize, zoom, and browser chrome.
 * Opt out locally with NEXT_PUBLIC_DISABLE_INSPECT=0.
 */
export function DisableInspect() {
  useEffect(() => {
    if (!shouldBlockInspect()) return

    document.addEventListener("contextmenu", blockContextMenu, true)
    document.addEventListener("keydown", onKeyEvent, true)
    window.addEventListener("keydown", onKeyEvent, true)

    // Clear any leftover overlay from older builds that used size detection.
    document.getElementById("mn-inspect-block-overlay")?.remove()

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu, true)
      document.removeEventListener("keydown", onKeyEvent, true)
      window.removeEventListener("keydown", onKeyEvent, true)
    }
  }, [])

  return null
}
