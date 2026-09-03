"use client"

import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { REFRESH_INTERVAL_OPTIONS } from "@/constants/settings"

export type PreferencesPersistStatus = "idle" | "saving" | "saved"

interface PreferencesSectionProps {
  refreshInterval: string
  onRefreshIntervalChange: (value: string) => void
}

/** Task list / dashboard auto-refresh interval. */
export function PreferencesSection({ refreshInterval, onRefreshIntervalChange }: PreferencesSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="task-defaults" accent="emerald" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-emerald-400" />
          <div>
            <CardTitle className="text-base font-semibold leading-snug">Tasks & polling</CardTitle>
            <CardDescription>How often task lists and running tasks refresh in the background.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs">
          <Label htmlFor="refreshInterval">Auto-refresh interval</Label>
          <Select
            id="refreshInterval"
            value={refreshInterval}
            onChange={(e) => onRefreshIntervalChange(e.target.value)}
            className="mt-1.5"
          >
            {REFRESH_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Applies to Dashboard, Tasks list, and open task detail while status is running. Choose Manual only to disable.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
