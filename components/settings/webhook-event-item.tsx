"use client"

import { CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface WebhookEventItemProps {
  event: string
  checked: boolean
  onToggle: () => void
}

export function WebhookEventItem({ event, checked, onToggle }: WebhookEventItemProps) {
  const label = event
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <label
      htmlFor={event}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200",
        checked
          ? "border-cyan-500/30 bg-cyan-500/5"
          : "border-border/50 hover:bg-accent/30"
      )}
    >
      <Checkbox id={event} checked={checked} onChange={onToggle} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{label}</span>
      </div>
      {checked && (
        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
      )}
    </label>
  )
}
