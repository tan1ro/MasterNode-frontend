"use client"

import { useEffect, useState } from "react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { workspaceDisplayNameFromStorage } from "@/lib/workspace-display-name"

export function useWorkspaceDisplayName(): string {
  const { user } = useAppAuth()
  const [displayName, setDisplayName] = useState(() => workspaceDisplayNameFromStorage(user))

  useEffect(() => {
    const sync = () => setDisplayName(workspaceDisplayNameFromStorage(user))
    sync()
    window.addEventListener("masternode-settings-changed", sync)
    return () => window.removeEventListener("masternode-settings-changed", sync)
  }, [user?.username, user?.email, user])

  return displayName
}
