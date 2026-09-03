"use client"

import { cn } from "@/lib/utils"
import type { PreferencesPersistStatus } from "./preferences-section"

interface SettingsSaveStatusProps {
  persistStatus: PreferencesPersistStatus
  savedAt: Date | null
}

export function SettingsSaveStatus({ persistStatus, savedAt }: SettingsSaveStatusProps) {
  if (persistStatus === "idle") return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        "border-border/50 bg-muted/10 dark:border-white/10 dark:bg-white/[0.03]",
        persistStatus === "saved" && "text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        persistStatus === "saving" && "text-amber border-amber/25"
      )}
      role="status"
      aria-live="polite"
    >
      {persistStatus === "saving" && <span>Saving preferences…</span>}
      {persistStatus === "saved" && savedAt && (
        <span>Saved · {savedAt.toLocaleTimeString(undefined, { timeStyle: "short" })}</span>
      )}
    </div>
  )
}
