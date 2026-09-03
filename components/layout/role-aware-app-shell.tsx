"use client"

import type { ReactNode } from "react"

/**
 * @deprecated Hub routes now always use {@link AppShellLayout}.
 * Kept as a passthrough for any lingering imports.
 */
export function RoleAwareAppShell({ children }: { children: ReactNode }) {
  return <>{children}</>
}
