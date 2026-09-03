"use client"

import { useEffect } from "react"
import { desktopOsFromUserAgent, isMasterNodeDesktop } from "@/lib/desktop-runtime"

/** Marks the document when MasterNode is running inside the native desktop shell. */
export function DesktopAppBridge() {
  useEffect(() => {
    if (!isMasterNodeDesktop()) return
    document.documentElement.classList.add("mn-desktop")
    document.documentElement.dataset.desktopOs = desktopOsFromUserAgent()
  }, [])

  return null
}
