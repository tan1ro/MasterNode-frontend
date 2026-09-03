import * as React from "react"
import { AlertCircle, Info, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalloutProps {
  children: React.ReactNode
  type?: "info" | "warning" | "success" | "error" | "note"
  title?: string
  className?: string
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: "bg-sky/10",
    border: "border-sky/20",
    text: "text-sky",
    iconColor: "text-sky"
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber/10",
    border: "border-amber/20",
    text: "text-amber",
    iconColor: "text-amber"
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald/10",
    border: "border-emerald/20",
    text: "text-emerald",
    iconColor: "text-emerald"
  },
  error: {
    icon: XCircle,
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
    iconColor: "text-destructive"
  },
  note: {
    icon: Lightbulb,
    bg: "bg-violet/10",
    border: "border-violet/20",
    text: "text-violet",
    iconColor: "text-violet"
  }
}

export function Callout({ children, type = "info", title, className }: CalloutProps) {
  const config = calloutConfig[type]
  const Icon = config.icon

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn("font-heading font-semibold mb-1", config.text)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm", config.text)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
