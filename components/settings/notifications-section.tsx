"use client"

import { BellRing } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Callout } from "@/components/ui/callout"

interface NotificationsSectionProps {
  notifyOnTaskComplete: boolean
  soundOnComplete: boolean
  onNotifyChange: (value: boolean) => void
  onSoundChange: (value: boolean) => void
}

export function NotificationsSection({
  notifyOnTaskComplete,
  soundOnComplete,
  onNotifyChange,
  onSoundChange,
}: NotificationsSectionProps) {
  const canNotify = typeof window !== "undefined" && "Notification" in window

  const handleNotifyToggle = async (checked: boolean) => {
    if (checked && canNotify && Notification.permission === "default") {
      await Notification.requestPermission()
    }
    onNotifyChange(checked)
  }

  return (
    <Card variant="minimal" interactive={false} id="notifications" accent="cyan" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-cyan-400" />
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Browser alerts when tasks finish while this tab is in the background.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canNotify && (
          <Callout type="note" title="Not supported">
            This browser does not support desktop notifications.
          </Callout>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={notifyOnTaskComplete}
            disabled={!canNotify}
            onChange={(e) => void handleNotifyToggle(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium text-foreground">Notify when a task completes or fails</span>
            <span className="block text-xs text-muted-foreground">
              Requires permission. Works when you have a task detail or chat run open.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={soundOnComplete}
            onChange={(e) => onSoundChange(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium text-foreground">Play a short sound on completion</span>
            <span className="block text-xs text-muted-foreground">Subtle chime when a terminal status is detected.</span>
          </span>
        </label>
      </CardContent>
    </Card>
  )
}
