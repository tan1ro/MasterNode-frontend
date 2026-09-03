"use client"

import { cn } from "@/lib/utils"
import { CLIENT_CHANNEL_UI } from "@/constants/client-channel"
import type { ClientChannel } from "@/types/api"

interface TrafficSourceTabsProps {
  value: ClientChannel
  onChange: (channel: ClientChannel) => void
  className?: string
  "aria-label"?: string
}

export function TrafficSourceTabs({
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Traffic source",
}: TrafficSourceTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex w-full sm:w-auto rounded-md border border-input bg-background p-1",
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "api"}
        onClick={() => onChange("api")}
        className={cn(
          "flex-1 sm:flex-none px-3 py-1.5 text-sm rounded-sm transition-colors",
          value === "api"
            ? "bg-amber text-amber-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {CLIENT_CHANNEL_UI.api}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "web"}
        onClick={() => onChange("web")}
        className={cn(
          "flex-1 sm:flex-none px-3 py-1.5 text-sm rounded-sm transition-colors",
          value === "web"
            ? "bg-amber text-amber-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {CLIENT_CHANNEL_UI.web}
      </button>
    </div>
  )
}
