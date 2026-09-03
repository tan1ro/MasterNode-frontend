"use client"

import { useEffect, useState } from "react"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

export interface ChatDisplayPrefs {
  renderMarkdown: boolean
  syntaxHighlighting: boolean
  sendOnEnter: boolean
}

export function useChatDisplayPrefs(): ChatDisplayPrefs {
  const [prefs, setPrefs] = useState<ChatDisplayPrefs>(() => {
    const p = loadSettingsPreferences()
    return {
      renderMarkdown: p.renderMarkdown,
      syntaxHighlighting: p.syntaxHighlighting,
      sendOnEnter: p.sendOnEnter,
    }
  })

  useEffect(() => {
    const sync = () => {
      const p = loadSettingsPreferences()
      setPrefs({
        renderMarkdown: p.renderMarkdown,
        syntaxHighlighting: p.syntaxHighlighting,
        sendOnEnter: p.sendOnEnter,
      })
    }
    sync()
    window.addEventListener("masternode-settings-changed", sync)
    return () => window.removeEventListener("masternode-settings-changed", sync)
  }, [])

  return prefs
}
