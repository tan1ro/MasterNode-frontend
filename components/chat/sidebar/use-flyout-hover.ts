"use client"

import { useCallback, useRef, useState } from "react"

const CLOSE_DELAY_MS = 120

/** Keeps portaled flyouts open while moving the pointer from trigger to submenu. */
export function useFlyoutHover() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    timerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }, [cancelClose])

  const onEnter = useCallback(() => {
    cancelClose()
    setOpen(true)
  }, [cancelClose])

  const onLeave = useCallback(() => {
    scheduleClose()
  }, [scheduleClose])

  const close = useCallback(() => {
    cancelClose()
    setOpen(false)
  }, [cancelClose])

  return { open, onEnter, onLeave, close, setOpen }
}
