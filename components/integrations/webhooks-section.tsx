"use client"

import Link from "next/link"
import { Bell, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { settingsPanelHref } from "@/lib/settings-panel-routes"

export function WebhooksSection() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Outbound webhooks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          MasterNode can POST task lifecycle events to your own URL—separate from inbound connector
          webhooks (e.g. n8n).
        </p>
      </div>

      <Card accent="cyan">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan shrink-0" aria-hidden />
            <div>
              <CardTitle className="text-base">Task finished webhooks</CardTitle>
              <CardDescription>
                Notify Slack, CI, or custom services when tasks complete or fail
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Configure URL and event types in Settings. Events use CloudEvents-style payloads for{" "}
            <code className="text-xs bg-muted px-1 rounded">task.accepted</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">task.completed</code>, and{" "}
            <code className="text-xs bg-muted px-1 rounded">task.failed</code>.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={settingsPanelHref("webhooks")}>
              Open webhook settings
              <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-60" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
