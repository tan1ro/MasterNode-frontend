"use client"

import { useCallback, useEffect, useState } from "react"
import type { DesktopUpdateState } from "@/lib/desktop-version"
import {
  desktopVersionFromUserAgent,
  formatDesktopVersionLabel,
} from "@/lib/desktop-version"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"

const IDLE: DesktopUpdateState = {
  currentVersion: desktopVersionFromUserAgent() || "0.0.0",
  latestVersion: null,
  status: "idle",
  progress: 0,
  error: null,
}

function desktopBridge() {
  if (typeof window === "undefined") return undefined
  return window.masternodeDesktop
}

export function useDesktopUpdate() {
  const isDesktop = isMasterNodeDesktop()
  const [state, setState] = useState<DesktopUpdateState>(IDLE)

  useEffect(() => {
    if (!isDesktop) return
    const api = desktopBridge()
    let unsub: (() => void) | undefined
    if (api?.onUpdateState) {
      unsub = api.onUpdateState((next) => {
        if (next) setState(next)
      })
    }
    void (api?.getVersion?.() ?? Promise.resolve(null)).then((info) => {
      if (!info?.current) return
      setState((prev) => ({
        ...prev,
        currentVersion:
          prev.currentVersion && prev.currentVersion !== "0.0.0"
            ? prev.currentVersion
            : info.current,
        packaged: info.packaged ?? prev.packaged,
      }))
    })
    void (api?.getUpdateState?.() ?? Promise.resolve(null)).then((next) => {
      if (next) setState(next)
    })
    void (api?.checkForUpdate?.() ?? Promise.resolve(null)).then((next) => {
      if (next) setState(next)
    })
    const timer = window.setInterval(() => {
      void api?.checkForUpdate?.()
    }, 4 * 60 * 60 * 1000)
    return () => {
      window.clearInterval(timer)
      unsub?.()
    }
  }, [isDesktop])

  const checkForUpdate = useCallback(async () => {
    const next = await desktopBridge()?.checkForUpdate?.()
    if (next) setState(next)
    return next ?? state
  }, [state])

  const startUpdate = useCallback(async () => {
    const next = await desktopBridge()?.startUpdate?.()
    if (next) setState(next)
    return next ?? state
  }, [state])

  const relaunchUpdate = useCallback(async () => {
    return desktopBridge()?.relaunchUpdate?.() ?? { ok: false }
  }, [])

  return {
    isDesktop,
    state,
    versionLabel: formatDesktopVersionLabel(state.currentVersion),
    latestLabel: formatDesktopVersionLabel(state.latestVersion || state.currentVersion),
    checkForUpdate,
    startUpdate,
    relaunchUpdate,
  }
}
