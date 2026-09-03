"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const CHAT_SELECTABLE_SELECTOR = '[data-chat-selectable="true"]'

export interface ChatTextSelectionState {
  text: string
  rect: DOMRect
}

export function isSelectionInChatSelectable(
  container: HTMLElement,
  range: Range
): boolean {
  const anchorNode = range.commonAncestorContainer
  const element =
    anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : (anchorNode as Element)
  if (!element || !container.contains(element)) return false
  const selectable = element.closest(CHAT_SELECTABLE_SELECTOR)
  return Boolean(selectable && container.contains(selectable))
}

export function useChatTextSelection(container: HTMLElement | null) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<ChatTextSelectionState | null>(null)

  const clearSelection = useCallback(() => {
    setSelection(null)
    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) sel.removeAllRanges()
  }, [])

  const readSelection = useCallback(() => {
    if (!container) {
      setSelection(null)
      return
    }

    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelection(null)
      return
    }

    const text = sel.toString().trim()
    if (!text) {
      setSelection(null)
      return
    }

    const range = sel.getRangeAt(0)
    if (!isSelectionInChatSelectable(container, range)) {
      setSelection(null)
      return
    }

    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setSelection(null)
      return
    }

    setSelection({ text, rect })
  }, [container])

  useEffect(() => {
    if (!container) {
      setSelection(null)
      return
    }

    const onSelectionChange = () => {
      window.requestAnimationFrame(readSelection)
    }

    const onMouseUp = () => {
      window.requestAnimationFrame(readSelection)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift" || event.key.startsWith("Arrow")) {
        window.requestAnimationFrame(readSelection)
      }
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (toolbarRef.current?.contains(target)) return
      if (!container.contains(target)) clearSelection()
    }

    const onScroll = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        clearSelection()
        return
      }
      window.requestAnimationFrame(readSelection)
    }

    container.addEventListener("mouseup", onMouseUp)
    container.addEventListener("keyup", onKeyUp)
    document.addEventListener("selectionchange", onSelectionChange)
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("scroll", onScroll, true)

    return () => {
      container.removeEventListener("mouseup", onMouseUp)
      container.removeEventListener("keyup", onKeyUp)
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("scroll", onScroll, true)
    }
  }, [clearSelection, container, readSelection])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearSelection()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [clearSelection])

  return { selection, clearSelection, toolbarRef, readSelection }
}
