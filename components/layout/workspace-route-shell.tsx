"use client"

import type { ReactNode } from "react"

/**
 * @deprecated Hub routes always use the chat sidebar shell.
 * Kept for compatibility with any lingering imports.
 */
export function WorkspaceRouteShell({
  chatShell,
}: {
  chatShell: ReactNode
  standaloneShell?: ReactNode
}) {
  return <>{chatShell}</>
}
