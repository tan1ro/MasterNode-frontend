"use client"

import { Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { WEBHOOK_EVENTS } from "@/constants/settings"
import { WebhookEventItem } from "./webhook-event-item"
import { SaveButton } from "./save-button"

interface WebhookSectionProps {
  webhookUrl: string
  webhookEvents: string[]
  saved: boolean
  isPending: boolean
  error: Error | null
  onUrlChange: (value: string) => void
  onEventToggle: (event: string) => void
  onSave: () => void
}

export function WebhookSection({
  webhookUrl,
  webhookEvents,
  saved,
  isPending,
  error,
  onUrlChange,
  onEventToggle,
  onSave,
}: WebhookSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="webhooks" accent="cyan">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-cyan-400" />
          <div>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Receive real-time notifications about task events via HTTP callbacks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            type="url"
            placeholder="https://your-domain.com/webhook"
            value={webhookUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Events will be sent as POST requests with a JSON payload
          </p>
        </div>

        <div>
          <Label className="mb-2 block">Events to Subscribe</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <WebhookEventItem
                key={event}
                event={event}
                checked={webhookEvents.includes(event)}
                onToggle={() => onEventToggle(event)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <SaveButton
            onClick={onSave}
            disabled={
              !webhookUrl || webhookEvents.length === 0 || isPending || saved
            }
            saved={saved}
            label="Save Webhook"
          />
          {webhookEvents.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {webhookEvents.length} event
              {webhookEvents.length !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        {error && (
          <ApiErrorCallout
            error={error}
            title="Failed to save webhook"
            fallbackMessage="Failed to save webhook"
          />
        )}
      </CardContent>
    </Card>
  )
}
